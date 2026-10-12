import { Incident, HazardType, SeverityLevel, DataSourceStatus } from '../types/disaster';
import { DEMO_INCIDENTS } from '../data/demoIncidents';
import { fetchDisastersFromDb, fetchSyncLogs } from './dbClient';

const USGS_FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
const NASA_EONET_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?limit=30&status=open';

export interface FetchResult {
  incidents: Incident[];
  statuses: DataSourceStatus[];
  lastUpdated: string;
}

export async function fetchLiveIncidents(): Promise<FetchResult> {
  const now = new Date().toISOString();

  // Try fetching from the persistent database endpoint first
  try {
    const { disasters } = await fetchDisastersFromDb({ limit: 200 });
    if (disasters && disasters.length > 0) {
      const logs = await fetchSyncLogs(5);
      const usgsLog = logs.find(l => l.sourceName.includes('USGS'));
      const nasaLog = logs.find(l => l.sourceName.includes('NASA'));
      const noaaLog = logs.find(l => l.sourceName.includes('NOAA'));
      const imdLog = logs.find(l => l.sourceName.includes('IMD'));

      const statuses: DataSourceStatus[] = [
        {
          name: 'USGS Earthquake Realtime Feed',
          endpoint: 'earthquake.usgs.gov/fdsnws/event/1',
          status: usgsLog?.status === 'failed' ? 'degraded' : 'operational',
          lastChecked: usgsLog?.syncTimestamp || now,
          latencyMs: usgsLog?.durationMs || 120,
          incidentCount: disasters.filter(d => d.hazardType === 'earthquake').length,
        },
        {
          name: 'NASA EONET v3 Natural Hazards',
          endpoint: 'eonet.gsfc.nasa.gov/api/v3/events',
          status: nasaLog?.status === 'failed' ? 'degraded' : 'operational',
          lastChecked: nasaLog?.syncTimestamp || now,
          latencyMs: nasaLog?.durationMs || 250,
          incidentCount: disasters.filter(d => ['wildfire', 'volcano'].includes(d.hazardType)).length,
        },
        {
          name: 'NOAA IBTrACS Historical Cyclone Archive',
          endpoint: 'ncei.noaa.gov/products/ibtracs',
          status: 'operational',
          lastChecked: noaaLog?.syncTimestamp || now,
          latencyMs: noaaLog?.durationMs || 45,
          incidentCount: disasters.filter(d => d.hazardType === 'cyclone').length,
        },
        {
          name: 'IMD / NDMA Warning Sensor Gateway',
          endpoint: 'mausam.imd.gov.in / ndma.gov.in',
          status: 'operational',
          lastChecked: imdLog?.syncTimestamp || now,
          latencyMs: imdLog?.durationMs || 65,
          incidentCount: disasters.filter(d => d.country === 'India').length,
        },
      ];

      return {
        incidents: disasters,
        statuses,
        lastUpdated: now,
      };
    }
  } catch (err) {
    console.warn('Persistent DB read failed, falling back to direct feed fetch:', err);
  }

  // Fallback direct feed fetch
  const incidents: Incident[] = [];
  const statuses: DataSourceStatus[] = [];

  // 1. Fetch USGS Earthquakes
  const usgsStart = performance.now();
  try {
    const res = await fetch(USGS_FEED_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`USGS HTTP ${res.status}`);
    const data = await res.json();
    const usgsLatency = Math.round(performance.now() - usgsStart);

    let count = 0;
    if (data && Array.isArray(data.features)) {
      for (const f of data.features) {
        const p = f.properties;
        const coords = f.geometry.coordinates;
        if (!coords || coords.length < 2) continue;

        const mag = p.mag || 0;
        let severity: SeverityLevel = 'low';
        if (mag >= 7.0) severity = 'critical';
        else if (mag >= 5.5) severity = 'high';
        else if (mag >= 4.0) severity = 'moderate';

        const place = p.place || 'Unknown Location';
        const isIndia = place.toLowerCase().includes('india') || 
          (coords[1] >= 6.5 && coords[1] <= 37.5 && coords[0] >= 68.0 && coords[0] <= 97.5);

        const parts = place.split(',');
        const country = parts.length > 1 ? parts[parts.length - 1].trim() : (isIndia ? 'India' : 'International Waters');

        const incident: Incident = {
          id: `usgs-${f.id}`,
          providerEventId: f.id,
          title: `M ${mag.toFixed(1)} ${mag >= 6.0 ? 'Major' : 'Seismic'} Event - ${place}`,
          hazardType: 'earthquake',
          severity,
          status: 'observed_event',
          lifecycle: 'active',
          location: place,
          country,
          region: isIndia ? 'South Asia' : 'Global',
          coordinates: {
            lat: coords[1],
            lng: coords[0],
            depthKm: coords[2] !== undefined ? Math.round(coords[2]) : undefined,
          },
          timestamp: new Date(p.time).toISOString(),
          startDate: new Date(p.time).toISOString(),
          magnitudeOrIntensity: `M ${mag.toFixed(1)}${coords[2] !== undefined ? ` • Depth ${Math.round(coords[2])}km` : ''}`,
          magnitudeValue: mag,
          depthKm: coords[2] !== undefined ? coords[2] : undefined,
          impactRadiusKm: Math.max(30, Math.round(Math.pow(10, Math.max(1, mag - 2.5) * 0.4) * 12)),
          source: 'USGS Earthquake Hazards Program',
          sourceUrl: p.url || 'https://earthquake.usgs.gov',
          verificationStatus: 'automated_sensor',
          description: `Hypocenter recorded at depth ${coords[2] !== undefined ? `${Math.round(coords[2])} km` : 'undetermined'}. Tsunami flag: ${p.tsunami ? 'Active Watch' : 'None'}. Review automated sensor data.`,
          safetyGuidance: [
            'DROP to your hands and knees.',
            'COVER your head and neck under sturdy shelter.',
            'HOLD ON until shaking completely stops.',
            'Expect aftershocks; avoid damaged masonry or falling glass.'
          ],
          lastUpdated: new Date(p.updated || p.time).toISOString(),
          lastSyncTime: now,
          isDemo: false,
        };

        incidents.push(incident);
        count++;
      }
    }

    statuses.push({
      name: 'USGS Earthquake Realtime Feed',
      endpoint: 'earthquake.usgs.gov/summary/2.5_day',
      status: 'operational',
      lastChecked: now,
      latencyMs: usgsLatency,
      incidentCount: count,
    });
  } catch {
    statuses.push({
      name: 'USGS Earthquake Realtime Feed',
      endpoint: 'earthquake.usgs.gov/summary/2.5_day',
      status: 'degraded',
      lastChecked: now,
      latencyMs: 0,
      incidentCount: 0,
    });
  }

  // 2. Fetch NASA EONET v3 Events
  const eonetStart = performance.now();
  try {
    const res = await fetch(NASA_EONET_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`NASA EONET HTTP ${res.status}`);
    const data = await res.json();
    const eonetLatency = Math.round(performance.now() - eonetStart);

    let count = 0;
    if (data && Array.isArray(data.events)) {
      for (const ev of data.events) {
        if (!ev.geometry || ev.geometry.length === 0) continue;
        const latestGeo = ev.geometry[ev.geometry.length - 1];
        if (!latestGeo.coordinates || latestGeo.coordinates.length < 2) continue;

        let hazard: HazardType = 'wildfire';
        const catId = ev.categories?.[0]?.id?.toLowerCase() || '';
        if (catId.includes('wildfire') || catId.includes('fire')) hazard = 'wildfire';
        else if (catId.includes('severe') || catId.includes('storm') || catId.includes('cyclone')) hazard = 'cyclone';
        else if (catId.includes('volcano')) hazard = 'volcano';
        else if (catId.includes('flood')) hazard = 'flood';
        else if (catId.includes('landslide')) hazard = 'landslide';

        let severity: SeverityLevel = 'moderate';
        if (hazard === 'cyclone') severity = 'high';
        if (hazard === 'wildfire') severity = 'high';

        const lat = latestGeo.coordinates[1];
        const lng = latestGeo.coordinates[0];
        const isIndia = lat >= 6.5 && lat <= 37.5 && lng >= 68.0 && lng <= 97.5;

        const incident: Incident = {
          id: `eonet-${ev.id}`,
          providerEventId: ev.id,
          title: ev.title || `Natural Hazard Event (${hazard.toUpperCase()})`,
          hazardType: hazard,
          severity,
          status: 'observed_event',
          lifecycle: 'active',
          location: ev.title,
          country: isIndia ? 'India' : 'International Zone',
          region: isIndia ? 'South Asia' : 'Global Observation',
          coordinates: { lat, lng },
          timestamp: latestGeo.date || new Date().toISOString(),
          startDate: latestGeo.date || new Date().toISOString(),
          magnitudeOrIntensity: ev.categories?.[0]?.title || 'Satellite Observed',
          impactRadiusKm: hazard === 'cyclone' ? 220 : 50,
          source: 'NASA Earth Observatory (EONET v3)',
          sourceUrl: ev.link || 'https://eonet.gsfc.nasa.gov',
          verificationStatus: 'verified_official',
          description: `Observed natural hazard tracking via NASA Earth Science satellite constellations. Event Category: ${ev.categories?.[0]?.title || 'Natural Event'}.`,
          safetyGuidance: [
            'Follow official regional emergency management directives.',
            'Keep battery-powered communication receivers operational.',
            'Review local evacuation routes and emergency shelter lists.'
          ],
          lastUpdated: latestGeo.date || now,
          lastSyncTime: now,
          isDemo: false,
        };

        incidents.push(incident);
        count++;
      }
    }

    statuses.push({
      name: 'NASA EONET v3 Natural Hazards',
      endpoint: 'eonet.gsfc.nasa.gov/api/v3/events',
      status: 'operational',
      lastChecked: now,
      latencyMs: eonetLatency,
      incidentCount: count,
    });
  } catch {
    statuses.push({
      name: 'NASA EONET v3 Natural Hazards',
      endpoint: 'eonet.gsfc.nasa.gov/api/v3/events',
      status: 'degraded',
      lastChecked: now,
      latencyMs: 0,
      incidentCount: 0,
    });
  }

  if (incidents.length === 0) {
    return {
      incidents: DEMO_INCIDENTS,
      statuses: statuses.map(s => ({ ...s, status: 'mock_fallback' })),
      lastUpdated: now,
    };
  }

  return {
    incidents,
    statuses,
    lastUpdated: now,
  };
}

export async function fetchLiveWeather(lat: number, lng: number) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m&hourly=precipitation_probability&forecast_days=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error('Weather API error');
    const data = await res.json();
    return {
      tempC: data.current?.temperature_2m ?? 28,
      humidity: data.current?.relative_humidity_2m ?? 65,
      precipitationMm: data.current?.precipitation ?? 0,
      windSpeedKmh: data.current?.wind_speed_10m ?? 12,
      windGustsKmh: data.current?.wind_gusts_10m ?? 18,
    };
  } catch {
    return null;
  }
}
