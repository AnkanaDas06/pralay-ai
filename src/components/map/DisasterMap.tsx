import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Incident, EmergencyResource } from '../../types/disaster';
import { 
  Layers, 
  Crosshair, 
  Building2, 
  Maximize2, 
  Minimize2,
  Activity,
  Wind,
  Droplets,
  Flame,
  Mountain,
  Waves,
  Info,
  ChevronUp,
  ChevronDown,
  Globe
} from 'lucide-react';

interface DisasterMapProps {
  incidents: Incident[];
  emergencyResources?: EmergencyResource[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
  focusedCoordinates?: { lat: number; lng: number; zoom?: number } | null;
  heightClass?: string;
}

export type BaseCartographyType = 
  | 'english_street' 
  | 'osm' 
  | 'hot' 
  | 'satellite' 
  | 'topo'
  | 'english_dark';

export const DisasterMap: React.FC<DisasterMapProps> = ({
  incidents,
  emergencyResources = [],
  selectedIncident,
  onSelectIncident,
  focusedCoordinates,
  heightClass = 'h-[540px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const riskZonesLayerRef = useRef<L.LayerGroup | null>(null);
  const resourcesLayerRef = useRef<L.LayerGroup | null>(null);
  const tectonicsLayerRef = useRef<L.LayerGroup | null>(null);
  const cycloneTracksLayerRef = useRef<L.LayerGroup | null>(null);
  const overlayLabelsLayerRef = useRef<L.TileLayer | null>(null);

  // Layer toggles
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [showRiskZones, setShowRiskZones] = useState<boolean>(true);
  const [showCycloneTracks, setShowCycloneTracks] = useState<boolean>(true);
  const [showResources, setShowResources] = useState<boolean>(false);
  const [showTectonics, setShowTectonics] = useState<boolean>(true);
  // Default base layer: Natural light-colored world map with soft blue oceans, pale cream land & English names
  const [baseLayerType, setBaseLayerType] = useState<BaseCartographyType>('english_street');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [layerMenuOpen, setLayerMenuOpen] = useState<boolean>(false);
  const [legendExpanded, setLegendExpanded] = useState<boolean>(false);

  // Map Tile Class mapping
  const getContainerTileClass = (type: BaseCartographyType) => {
    switch (type) {
      case 'english_street': return 'map-natural-tiles';
      case 'osm': return 'map-osm-tiles';
      case 'hot': return 'map-hot-tiles';
      case 'satellite': return 'map-satellite-tiles';
      case 'topo': return 'map-osm-tiles';
      case 'english_dark': return 'map-dark-tiles';
      default: return 'map-natural-tiles';
    }
  };

  // Initialize Interactive World Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Determine default global view zoom based on container width
    const initialZoom = window.innerWidth < 768 ? 1.5 : 2;

    const map = L.map(mapContainerRef.current, {
      center: [18, 0], // Perfectly balances Americas, Europe/Africa, Asia, and Australia
      zoom: initialZoom,
      minZoom: 1,
      maxZoom: 18,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: true,
      scrollWheelZoom: true,
    });

    // Custom zoom control in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Official PRALAY Attribution Prefix
    map.attributionControl.setPrefix(
      '<span class="text-blue-600 font-mono font-bold">PRALAY AI Geospatial Core</span>'
    );

    // Create persistent layer groups
    markersLayerRef.current = L.layerGroup().addTo(map);
    riskZonesLayerRef.current = L.layerGroup().addTo(map);
    resourcesLayerRef.current = L.layerGroup();
    tectonicsLayerRef.current = L.layerGroup().addTo(map);
    cycloneTracksLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size immediately after initial mount
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Responsive ResizeObserver: guarantees map completely fills container on sidebar collapse/expand
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Update Base Tile Layer with 100% Free, Keyless, English-Labeled Map Providers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers and overlay label layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (overlayLabelsLayerRef.current) {
      if (map.hasLayer(overlayLabelsLayerRef.current)) {
        map.removeLayer(overlayLabelsLayerRef.current);
      }
      overlayLabelsLayerRef.current = null;
    }

    let tileUrl = '';
    let attribution = '';
    let subdomains: string[] | string = ['a', 'b', 'c'];
    let maxZoom = 18;
    let addSatelliteEnglishOverlay = false;

    switch (baseLayerType) {
      case 'english_street':
        // Full-color detailed English world street map: soft blue oceans, pale cream land, English names
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Map Data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors | Tiles &copy; <a href="https://www.esri.com/" target="_blank">Esri</a> (English)';
        subdomains = [];
        maxZoom = 18;
        break;

      case 'osm':
        // Standard OpenStreetMap Global Tiles
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';
        subdomains = ['a', 'b', 'c'];
        maxZoom = 19;
        break;

      case 'hot':
        // Humanitarian OpenStreetMap Team (Disaster Response & Relief Cartography)
        tileUrl = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
        attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, Tiles courtesy of <a href="https://www.hotosm.org/" target="_blank">Humanitarian OSM</a>';
        subdomains = ['a', 'b'];
        maxZoom = 19;
        break;

      case 'satellite':
        // Satellite World Imagery with crisp English boundaries & place names overlay
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Satellite &copy; <a href="https://www.esri.com/" target="_blank">Esri</a>, USGS, NOAA';
        subdomains = [];
        maxZoom = 18;
        addSatelliteEnglishOverlay = true;
        break;

      case 'topo':
        // World Physical Terrain & Topography in English
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Terrain &copy; <a href="https://www.esri.com/" target="_blank">Esri</a>, DeLorme, USGS (English)';
        subdomains = [];
        maxZoom = 18;
        break;

      case 'english_dark':
        // High-contrast dark operations shader
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Map Data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors | Tiles &copy; <a href="https://www.esri.com/" target="_blank">Esri</a>';
        subdomains = [];
        maxZoom = 18;
        break;
    }

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom,
      attribution,
      subdomains,
      crossOrigin: true,
      noWrap: false,
    });

    // Graceful error logging for network tiles
    tileLayer.on('tileerror', (e) => {
      console.warn('Map tile loading event (network check):', e);
    });

    tileLayer.addTo(map);

    // If satellite view selected, add English reference labels and country boundaries on top
    if (addSatelliteEnglishOverlay) {
      const labelsLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          crossOrigin: true,
          noWrap: false,
        }
      );
      labelsLayer.addTo(map);
      overlayLabelsLayerRef.current = labelsLayer;
    }
  }, [baseLayerType]);

  // Draw Pacific Ring of Fire & Major Tectonic Boundaries
  useEffect(() => {
    const layer = tectonicsLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (!showTectonics) return;

    // Pacific Ring of Fire major fault segment coords
    const ringOfFire: [number, number][] = [
      [-45, 168], [-35, 178], [-15, 167], [-5, 145], [0, 125], [15, 120], [35, 140], 
      [52, 160], [60, 165], [60, -165], [55, -160], [58, -135], [48, -125], 
      [35, -120], [20, -105], [5, -80], [-15, -75], [-35, -72], [-55, -68]
    ];

    // Himalayan Alpine-Himalayan Belt (India collision zone)
    const himalayanBelt: [number, number][] = [
      [36, 68], [34, 74], [31, 78], [28, 84], [27, 92], [26, 96], [22, 94], [15, 93], [5, 96], [-5, 105], [-8, 115]
    ];

    L.polyline(ringOfFire, {
      color: '#0284c7',
      weight: 2.2,
      opacity: 0.8,
      dashArray: '5, 6',
      lineCap: 'round'
    }).bindTooltip('Pacific Ring of Fire Subduction Fault Corridor', { sticky: true }).addTo(layer);

    L.polyline(himalayanBelt, {
      color: '#ea580c',
      weight: 2.5,
      opacity: 0.85,
      dashArray: '6, 6',
      lineCap: 'round'
    }).bindTooltip('Himalayan Alpine Collision Seismic Arc (Zone V/IV)', { sticky: true }).addTo(layer);
  }, [showTectonics]);

  // Update Hazard Markers, Risk Zones, and Cyclone Storm Tracks
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const riskZonesLayer = riskZonesLayerRef.current;
    const cycloneTracksLayer = cycloneTracksLayerRef.current;
    if (!map || !markersLayer || !riskZonesLayer) return;

    markersLayer.clearLayers();
    riskZonesLayer.clearLayers();
    if (cycloneTracksLayer) cycloneTracksLayer.clearLayers();

    if (!showMarkers && !showRiskZones && !showCycloneTracks) return;

    incidents.forEach((incident) => {
      const { lat, lng } = incident.coordinates;
      const isSelected = selectedIncident?.id === incident.id;
      const isHistorical = incident.lifecycle === 'historical' || incident.lifecycle === 'resolved';

      // 1. Draw NOAA IBTrACS Cyclone Storm Progression Tracks
      if (showCycloneTracks && cycloneTracksLayer && incident.cycloneTracks && incident.cycloneTracks.length > 0) {
        const trackCoords: [number, number][] = incident.cycloneTracks.map(pt => [pt.lat, pt.lng]);
        
        const trackPolyline = L.polyline(trackCoords, {
          color: isSelected ? '#06b6d4' : '#0284c7',
          weight: isSelected ? 3.5 : 2.2,
          opacity: isSelected ? 0.95 : 0.7,
          dashArray: isHistorical ? '5, 5' : undefined,
          lineCap: 'round',
        });

        trackPolyline.bindTooltip(`
          <div class="p-1 font-sans text-xs text-slate-800">
            <span class="font-bold text-slate-900">${incident.title}</span><br/>
            <span class="text-blue-700 font-semibold">NOAA IBTrACS Track (${incident.cycloneTracks.length} Waypoints)</span><br/>
            <span class="text-slate-600 font-mono">Status: ${isHistorical ? 'Historical Archive' : 'Active Track'}</span>
          </div>
        `, { sticky: true });

        trackPolyline.on('click', () => {
          onSelectIncident(incident);
        });

        trackPolyline.addTo(cycloneTracksLayer);

        // Draw Waypoint nodes along the storm track
        incident.cycloneTracks.forEach((pt, idx) => {
          const isLandfall = idx === incident.cycloneTracks!.length - 2 || pt.stage?.toLowerCase().includes('landfall');
          const waypointMarker = L.circleMarker([pt.lat, pt.lng], {
            radius: isLandfall ? 5 : 3.5,
            fillColor: pt.windSpeedKmh && pt.windSpeedKmh >= 200 ? '#ef4444' : (pt.windSpeedKmh && pt.windSpeedKmh >= 130 ? '#f97316' : '#06b6d4'),
            color: '#ffffff',
            weight: 1,
            fillOpacity: 0.9,
          });

          waypointMarker.bindTooltip(`
            <div class="p-1 font-sans text-xs text-slate-800">
              <strong>${pt.category || pt.stage || 'Track Waypoint'}</strong><br/>
              ${pt.timestamp ? pt.timestamp.slice(0, 10) + ' ' + pt.timestamp.slice(11, 16) : ''}<br/>
              ${pt.windSpeedKmh ? `Sustained Wind: <strong>${pt.windSpeedKmh} km/h</strong><br/>` : ''}
              ${pt.pressureMb ? `Central Pressure: ${pt.pressureMb} hPa` : ''}
            </div>
          `, { sticky: true });

          waypointMarker.on('click', () => {
            onSelectIncident(incident);
          });

          waypointMarker.addTo(cycloneTracksLayer);
        });
      }

      // Color mapping with high contrast
      let color = '#059669'; // low: emerald
      let zoneBg = 'rgba(5, 150, 105, 0.15)';
      let borderColor = '#059669';

      if (incident.severity === 'critical') {
        color = '#dc2626'; // critical: bold red
        zoneBg = 'rgba(220, 38, 38, 0.22)';
        borderColor = '#dc2626';
      } else if (incident.severity === 'high') {
        color = '#ea580c'; // high: bold orange
        zoneBg = 'rgba(234, 88, 12, 0.18)';
        borderColor = '#ea580c';
      } else if (incident.severity === 'moderate') {
        color = '#d97706'; // moderate: bold amber
        zoneBg = 'rgba(217, 119, 6, 0.16)';
        borderColor = '#d97706';
      }

      if (isHistorical) {
        color = '#475569'; // Muted slate for historical records
        zoneBg = 'rgba(71, 85, 105, 0.14)';
        borderColor = '#64748b';
      }

      // Draw Calculated Physical Impact Radius (NOT official evacuation borders)
      if (showRiskZones) {
        const radiusMeters = (incident.impactRadiusKm || 50) * 1000;
        const circle = L.circle([lat, lng], {
          radius: radiusMeters,
          color: borderColor,
          weight: isSelected ? 2.5 : 1.5,
          dashArray: isHistorical ? '5, 5' : (incident.severity === 'critical' ? '4, 4' : undefined),
          fillColor: color,
          fillOpacity: isSelected ? 0.25 : (isHistorical ? 0.08 : 0.12),
        });

        circle.on('click', () => {
          onSelectIncident(incident);
        });

        circle.bindTooltip(`
          <div class="p-1 text-xs font-sans text-slate-800">
            <span class="font-bold text-slate-900">${incident.title}</span><br/>
            <span class="text-slate-600">Impact Radius: ~${incident.impactRadiusKm} km</span><br/>
            <span class="font-semibold" style="color:${borderColor}">Risk Level: ${incident.severity.toUpperCase()}</span>
            ${isHistorical ? '<br/><span class="text-slate-500 font-mono text-[10px]">[ARCHIVED HISTORICAL EVENT]</span>' : ''}
          </div>
        `, { sticky: true });

        circle.addTo(riskZonesLayer);
      }

      // Draw Hazard Point Marker
      if (showMarkers) {
        // SVG symbol based on hazard type
        let symbolSvg = '';
        if (incident.hazardType === 'earthquake') {
          symbolSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12h5l3 7 4-14 3 7h5"/></svg>`;
        } else if (incident.hazardType === 'cyclone') {
          symbolSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 0-9.8 8h3a7 7 0 0 1 6.8-6V2z"/><path d="M12 22a10 10 0 0 0 9.8-8h-3a7 7 0 0 1-6.8 6v2z"/></svg>`;
        } else if (incident.hazardType === 'flood') {
          symbolSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
        } else if (incident.hazardType === 'wildfire') {
          symbolSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>`;
        } else if (incident.hazardType === 'landslide') {
          symbolSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`;
        } else if (incident.hazardType === 'tsunami') {
          symbolSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12c1.5-3 3-5 5-5 2.5 0 3 3 5 3 2.5 0 3-3 5-3 2 0 3.5 2 5 5M2 17c1.5-3 3-5 5-5 2.5 0 3 3 5 3 2.5 0 3-3 5-3 2 0 3.5 2 5 5"/></svg>`;
        } else if (incident.hazardType === 'extreme_temp') {
          symbolSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`;
        } else {
          symbolSvg = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        }

        const isCrit = incident.severity === 'critical';
        const customHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${isCrit && !isHistorical ? `<div class="absolute w-11 h-11 rounded-full border-2 border-red-500/90 radar-ring pointer-events-none"></div>` : ''}
            <div class="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-125 border-2 ${isHistorical ? 'border-slate-300' : 'border-white'} shadow-md ${isSelected ? 'ring-4 ring-cyan-400 scale-125' : ''}"
                 style="background-color: ${color}; color: #ffffff; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.35);">
              ${symbolSvg}
            </div>
            ${isHistorical ? `<span class="absolute -bottom-2 px-1 rounded bg-slate-900 border border-slate-700 text-[8px] font-bold text-slate-300 pointer-events-none">HIST</span>` : ''}
          </div>
        `;

        const customIcon = L.divIcon({
          html: customHtml,
          className: 'disaster-custom-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const marker = L.marker([lat, lng], { icon: customIcon });

        marker.on('click', () => {
          onSelectIncident(incident);
        });

        // Popup with English emergency details and high contrast
        const popupContent = `
          <div class="p-2 min-w-[230px] max-w-[290px] font-sans text-slate-800">
            <div class="flex items-center gap-1.5 mb-1.5">
              <span class="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded" style="background:${zoneBg}; color:${borderColor}; border: 1px solid ${borderColor};">
                ${incident.severity}
              </span>
              <span class="text-[11px] font-mono text-slate-500 uppercase tracking-wider">${incident.hazardType}</span>
              ${isHistorical 
                ? '<span class="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">Historical</span>' 
                : '<span class="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">Live</span>'}
            </div>
            <h4 class="font-bold text-sm text-slate-900 leading-snug mb-1">${incident.title}</h4>
            <p class="text-xs text-slate-600 mb-2">${incident.location}</p>
            <div class="grid grid-cols-2 gap-1 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 mb-2 font-mono">
              <div><span class="text-slate-500">Coords:</span> <span class="text-blue-700 font-semibold">${lat.toFixed(2)}°, ${lng.toFixed(2)}°</span></div>
              <div><span class="text-slate-500">Radius:</span> <span class="text-slate-800 font-semibold">~${incident.impactRadiusKm} km</span></div>
              <div class="col-span-2 text-[10px] text-slate-500">Source: ${incident.source}</div>
              <div class="col-span-2 text-[10px] text-slate-500">Date: ${incident.timestamp.slice(0, 10)}</div>
            </div>
            <div class="text-[10px] font-mono text-blue-700 bg-blue-50 p-1.5 rounded-lg border border-blue-200 text-center font-medium">
              Click marker to inspect full event dossier
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersLayer);
      }
    });
  }, [incidents, showMarkers, showRiskZones, showCycloneTracks, selectedIncident]);

  // Update Emergency Resources Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const resLayer = resourcesLayerRef.current;
    if (!map || !resLayer) return;

    resLayer.clearLayers();

    if (!showResources) {
      if (map.hasLayer(resLayer)) map.removeLayer(resLayer);
      return;
    }

    if (!map.hasLayer(resLayer)) resLayer.addTo(map);

    emergencyResources.forEach((res) => {
      const { lat, lng } = res.coordinates;
      let iconColor = '#0284c7'; // blue
      let badge = 'HOSPITAL';
      if (res.category === 'ndrf_base') {
        iconColor = '#ea580c';
        badge = 'NDRF BASE';
      } else if (res.category === 'shelter') {
        iconColor = '#059669';
        badge = 'SHELTER';
      } else if (res.category === 'fire_station') {
        iconColor = '#dc2626';
        badge = 'FIRE & RESCUE';
      }

      const iconHtml = `
        <div class="w-7 h-7 rounded-lg flex items-center justify-center border-2 border-white shadow-md"
             style="background-color: ${iconColor}; color: #ffffff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85"/></svg>
        </div>
      `;

      const resourceIcon = L.divIcon({
        html: iconHtml,
        className: 'resource-custom-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lng], { icon: resourceIcon });
      marker.bindPopup(`
        <div class="p-2 min-w-[200px] font-sans text-slate-800">
          <span class="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">${badge}</span>
          <h4 class="font-bold text-xs text-slate-900 mt-1">${res.name}</h4>
          <p class="text-[11px] text-slate-600">${res.location}</p>
          <div class="mt-2 text-xs font-mono text-blue-700 font-medium">Phone: ${res.contactNumber}</div>
        </div>
      `);

      marker.addTo(resLayer);
    });
  }, [emergencyResources, showResources]);

  // Handle Focused Coordinates from parent
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusedCoordinates) return;

    map.flyTo([focusedCoordinates.lat, focusedCoordinates.lng], focusedCoordinates.zoom || 7, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [focusedCoordinates]);

  // Fly to selected incident
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedIncident) return;

    map.flyTo([selectedIncident.coordinates.lat, selectedIncident.coordinates.lng], 7, {
      duration: 1.2,
    });
  }, [selectedIncident]);

  // Handle Fullscreen Toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Reset to Complete World View: Shows all 7 continents simultaneously
  const focusGlobalWorldView = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const targetZoom = window.innerWidth < 768 ? 1.5 : 2;
    map.flyTo([18, 0], targetZoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, []);

  // Quick Focus on India Sector
  const focusIndiaSector = useCallback(() => {
    mapInstanceRef.current?.flyTo([21.5, 82.0], 5, { duration: 1.2 });
  }, []);

  // Quick Focus on Pacific Ring of Fire
  const focusRingOfFire = useCallback(() => {
    mapInstanceRef.current?.flyTo([15, 140], 3, { duration: 1.4 });
  }, []);

  return (
    <div className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen bg-[#060b18]' : heightClass} rounded-xl overflow-hidden border border-blue-900/40 shadow-xl transition-all duration-300 bg-white ${getContainerTileClass(baseLayerType)}`}>
      {/* Map DOM Element (Pure White Canvas for Light Cartography) */}
      <div ref={mapContainerRef} className="w-full h-full z-0 absolute inset-0 bg-white" />

      {/* Top Map Command Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {/* Navigation Quick Focus Buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#060b18]/90 backdrop-blur-md p-1.5 rounded-xl border border-blue-900/50 shadow-xl">
          <button
            onClick={focusGlobalWorldView}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-200 hover:text-white hover:bg-blue-900/40 rounded-lg transition"
            title="Reset to Full World View (All Continents)"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Reset to World View</span>
          </button>
          <div className="w-[1px] h-4 bg-blue-900/50" />
          <button
            onClick={focusIndiaSector}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-orange-300 hover:text-orange-200 bg-orange-950/60 hover:bg-orange-900/60 border border-orange-500/40 rounded-lg transition shadow-xs"
            title="Quick Focus on India Sector"
          >
            <Crosshair className="w-3.5 h-3.5 text-orange-400" />
            <span>India Sector Mode</span>
          </button>
          <div className="w-[1px] h-4 bg-blue-900/50" />
          <button
            onClick={focusRingOfFire}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-900/40 rounded-lg transition hidden sm:flex"
            title="Focus Pacific Ring of Fire Subduction Arc"
          >
            <Activity className="w-3.5 h-3.5 text-red-400" />
            <span>Ring of Fire</span>
          </button>
        </div>

        {/* Right Tools: Layers & Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Layer Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setLayerMenuOpen(!layerMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition shadow-xl ${
                layerMenuOpen ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#060b18]/90 backdrop-blur-md text-slate-200 border-blue-900/50 hover:bg-[#101a35]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400 group-hover:text-white" />
              <span>Map Layers</span>
            </button>

            {/* Layer Settings Dropdown */}
            {layerMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0b1328]/95 backdrop-blur-xl border border-blue-900/60 rounded-xl p-3.5 shadow-2xl z-30 text-xs text-slate-200">
                <div className="font-semibold text-white mb-2 pb-1.5 border-b border-blue-900/40 flex justify-between items-center">
                  <span>Geospatial Overlays</span>
                  <span className="text-[10px] text-blue-400 font-mono font-bold">ENGLISH LABELS</span>
                </div>

                <div className="space-y-2 mb-3.5">
                  <label className="flex items-center justify-between cursor-pointer hover:text-blue-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      Hazard Point Markers
                    </span>
                    <input
                      type="checkbox"
                      checked={showMarkers}
                      onChange={(e) => setShowMarkers(e.target.checked)}
                      className="accent-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer hover:text-blue-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                      Multi-Hazard Risk Radii
                    </span>
                    <input
                      type="checkbox"
                      checked={showRiskZones}
                      onChange={(e) => setShowRiskZones(e.target.checked)}
                      className="accent-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer hover:text-blue-300">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-3 h-3 text-blue-400" />
                      Emergency Facilities
                    </span>
                    <input
                      type="checkbox"
                      checked={showResources}
                      onChange={(e) => setShowResources(e.target.checked)}
                      className="accent-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer hover:text-blue-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-0.5 bg-blue-400"></span>
                      Tectonic Fault Lines
                    </span>
                    <input
                      type="checkbox"
                      checked={showTectonics}
                      onChange={(e) => setShowTectonics(e.target.checked)}
                      className="accent-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer hover:text-cyan-300">
                    <span className="flex items-center gap-2">
                      <Wind className="w-3 h-3 text-cyan-400" />
                      NOAA IBTrACS Storm Tracks
                    </span>
                    <input
                      type="checkbox"
                      checked={showCycloneTracks}
                      onChange={(e) => setShowCycloneTracks(e.target.checked)}
                      className="accent-cyan-500"
                    />
                  </label>
                </div>

                <div className="font-semibold text-white mb-2 pt-2 border-t border-blue-900/40 flex justify-between items-center">
                  <span>Base Cartography</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">LIGHT MAP</span>
                </div>
                
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setBaseLayerType('english_street')}
                    className={`py-1.5 px-2 text-[11px] rounded-lg font-mono text-left transition ${
                      baseLayerType === 'english_street' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 font-bold' : 'text-slate-300 hover:bg-[#101a35]'
                    }`}
                  >
                    🗺️ Light World Map
                  </button>
                  <button
                    onClick={() => setBaseLayerType('osm')}
                    className={`py-1.5 px-2 text-[11px] rounded-lg font-mono text-left transition ${
                      baseLayerType === 'osm' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 font-bold' : 'text-slate-300 hover:bg-[#101a35]'
                    }`}
                  >
                    🌍 OpenStreetMap
                  </button>
                  <button
                    onClick={() => setBaseLayerType('hot')}
                    className={`py-1.5 px-2 text-[11px] rounded-lg font-mono text-left transition ${
                      baseLayerType === 'hot' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 font-bold' : 'text-slate-300 hover:bg-[#101a35]'
                    }`}
                  >
                    🚨 Humanitarian HOT
                  </button>
                  <button
                    onClick={() => setBaseLayerType('satellite')}
                    className={`py-1.5 px-2 text-[11px] rounded-lg font-mono text-left transition ${
                      baseLayerType === 'satellite' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 font-bold' : 'text-slate-300 hover:bg-[#101a35]'
                    }`}
                  >
                    🛰️ Satellite (English)
                  </button>
                  <button
                    onClick={() => setBaseLayerType('topo')}
                    className={`py-1.5 px-2 text-[11px] rounded-lg font-mono text-left transition ${
                      baseLayerType === 'topo' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 font-bold' : 'text-slate-300 hover:bg-[#101a35]'
                    }`}
                  >
                    ⛰️ Physical Terrain
                  </button>
                  <button
                    onClick={() => setBaseLayerType('english_dark')}
                    className={`py-1.5 px-2 text-[11px] rounded-lg font-mono text-left transition ${
                      baseLayerType === 'english_dark' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 font-bold' : 'text-slate-300 hover:bg-[#101a35]'
                    }`}
                  >
                    🌙 Night Mode
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-[#060b18]/90 backdrop-blur-md text-slate-300 hover:text-white rounded-xl border border-blue-900/50 shadow-xl transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Visible Map Legend & Tactical Key (Floating Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-auto bg-[#060b18]/95 backdrop-blur-xl rounded-xl border border-blue-900/60 shadow-2xl text-xs max-w-sm transition-all duration-200 text-slate-200">
        {/* Legend Header Bar */}
        <div 
          onClick={() => setLegendExpanded(!legendExpanded)}
          className="flex items-center justify-between px-3.5 py-2 cursor-pointer hover:bg-blue-950/40 rounded-xl transition"
        >
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="font-bold text-white uppercase font-mono tracking-wider text-[11px]">
              Geospatial Legend & Tactical Key
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">{incidents.length} active events</span>
            {legendExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Compact Summary Strip (Visible When Not Expanded) */}
        {!legendExpanded && (
          <div className="px-3.5 pb-2.5 pt-0 flex items-center gap-3 text-[10px] font-mono border-t border-blue-900/40">
            <div className="flex items-center gap-1 text-red-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1 text-orange-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span>High</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Low</span>
            </div>
            <span className="text-slate-400 ml-auto text-[9px] hover:text-blue-400">
              (Click to expand)
            </span>
          </div>
        )}

        {/* Expanded Full Tactical Key Details */}
        {legendExpanded && (
          <div className="p-3.5 pt-2 border-t border-blue-900/40 space-y-3 max-h-72 overflow-y-auto text-[11px] panel-scrollbar">
            {/* Hazard Symbols */}
            <div>
              <span className="font-semibold text-slate-300 uppercase font-mono text-[10px] tracking-wider block mb-1.5">
                Hazard Symbols
              </span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Earthquake (M2.5+)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                  <span>Cyclone / Storm</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Flood / Inundation</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Active Wildfire</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Mountain className="w-3.5 h-3.5 text-amber-400" />
                  <span>Landslide / Slope</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Waves className="w-3.5 h-3.5 text-teal-400" />
                  <span>Tsunami / Marine</span>
                </div>
              </div>
            </div>

            {/* Severity Classifications */}
            <div>
              <span className="font-semibold text-slate-300 uppercase font-mono text-[10px] tracking-wider block mb-1.5">
                Severity Classifications
              </span>
              <div className="space-y-1 font-mono text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="text-red-400 font-bold">Critical:</span>
                  <span className="text-slate-300">M7.0+ or Cat 4-5 Cyclone</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span className="text-orange-400 font-bold">High:</span>
                  <span className="text-slate-300">M5.5 - 6.9 or Red Flood Alert</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-amber-400 font-bold">Moderate:</span>
                  <span className="text-slate-300">M4.0 - 5.4 or Weather Watch</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-emerald-400 font-bold">Low:</span>
                  <span className="text-slate-300">M2.5 - 3.9 / Baseline Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-300"></span>
                  <span className="text-slate-300 font-bold">Historical:</span>
                  <span className="text-slate-400">Verified Past Archive (Not Active)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-cyan-400"></span>
                  <span className="text-cyan-400 font-bold">Storm Track:</span>
                  <span className="text-slate-300">NOAA IBTrACS Historical Cyclone Path</span>
                </div>
              </div>
            </div>

            {/* Risk Zone Overlays Note */}
            <div className="p-2 rounded-lg bg-[#060b18] border border-blue-900/50 text-[10px] text-slate-300 leading-relaxed">
              <span className="font-semibold text-blue-300 block mb-0.5">Physical Impact Radii:</span>
              Circular overlays visualize calculated physical shockwave, surge, or fire reach in km. 
              <strong className="text-slate-200"> They are not official government evacuation boundaries.</strong> Always follow local emergency authority orders.
            </div>

            {/* Tectonic Boundaries */}
            <div>
              <span className="font-semibold text-slate-300 uppercase font-mono text-[10px] tracking-wider block mb-1">
                Tectonic Fault Belts
              </span>
              <div className="flex flex-col gap-1 text-[10px] font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-sky-400"></span>
                  <span>Pacific Ring of Fire Trench</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-orange-400"></span>
                  <span>Himalayan Collision Arc (Zone V)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
