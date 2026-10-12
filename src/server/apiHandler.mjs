import url from 'node:url';
import { getDisasters, getHistoricalStats, getDisasterById, getSyncLogs } from './db.mjs';
import { syncAllSources, seedHistoricalRecordsIfEmpty } from './ingest.mjs';

// Initialize seed data on load
seedHistoricalRecordsIfEmpty();

export async function handleApiRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Set CORS & JSON headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  // 1. GET /api/disasters
  if (pathname === '/api/disasters' && req.method === 'GET') {
    try {
      const hazardTypes = query.hazardTypes ? (Array.isArray(query.hazardTypes) ? query.hazardTypes : query.hazardTypes.split(',')) : [];
      const severities = query.severities ? (Array.isArray(query.severities) ? query.severities : query.severities.split(',')) : [];
      const lifecycles = query.lifecycles ? (Array.isArray(query.lifecycles) ? query.lifecycles : query.lifecycles.split(',')) : [];

      const filters = {
        startDate: query.startDate,
        endDate: query.endDate,
        hazardTypes,
        severities,
        lifecycles,
        country: query.country,
        searchQuery: query.searchQuery || query.q,
        limit: query.limit ? Number(query.limit) : 250,
        offset: query.offset ? Number(query.offset) : 0,
      };

      const records = getDisasters(filters);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        count: records.length,
        disasters: records,
        filters,
      }));
      return true;
    } catch (err) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 500;
      res.end(JSON.stringify({ success: false, error: err.message }));
      return true;
    }
  }

  // 2. GET /api/disasters/historical-stats
  if (pathname === '/api/disasters/historical-stats' && req.method === 'GET') {
    try {
      const hazardTypes = query.hazardTypes ? (Array.isArray(query.hazardTypes) ? query.hazardTypes : query.hazardTypes.split(',')) : [];
      const severities = query.severities ? (Array.isArray(query.severities) ? query.severities : query.severities.split(',')) : [];
      const lifecycles = query.lifecycles ? (Array.isArray(query.lifecycles) ? query.lifecycles : query.lifecycles.split(',')) : [];

      const filters = {
        startDate: query.startDate,
        endDate: query.endDate,
        hazardTypes,
        severities,
        lifecycles,
        country: query.country,
        searchQuery: query.searchQuery || query.q,
      };

      const stats = getHistoricalStats(filters);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, stats }));
      return true;
    } catch (err) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 500;
      res.end(JSON.stringify({ success: false, error: err.message }));
      return true;
    }
  }

  // 3. GET /api/disasters/:id
  if (pathname.startsWith('/api/disasters/') && req.method === 'GET') {
    const id = pathname.replace('/api/disasters/', '');
    if (id && id !== 'historical-stats' && id !== 'sync') {
      const disaster = getDisasterById(id);
      if (disaster) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, disaster }));
        return true;
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 404;
        res.end(JSON.stringify({ success: false, error: 'Disaster record not found' }));
        return true;
      }
    }
  }

  // 4. POST /api/disasters/sync (or POST /api/sync)
  if ((pathname === '/api/disasters/sync' || pathname === '/api/sync') && req.method === 'POST') {
    try {
      const syncResult = await syncAllSources();
      const logs = getSyncLogs(10);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, syncResult, recentLogs: logs }));
      return true;
    } catch (err) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 500;
      res.end(JSON.stringify({ success: false, error: err.message }));
      return true;
    }
  }

  // 5. GET /api/sync/logs
  if (pathname === '/api/sync/logs' && req.method === 'GET') {
    try {
      const logs = getSyncLogs(query.limit ? Number(query.limit) : 25);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, logs }));
      return true;
    } catch (err) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 500;
      res.end(JSON.stringify({ success: false, error: err.message }));
      return true;
    }
  }

  // 6. GET /api/export/csv
  if (pathname === '/api/export/csv' && req.method === 'GET') {
    try {
      const hazardTypes = query.hazardTypes ? (Array.isArray(query.hazardTypes) ? query.hazardTypes : query.hazardTypes.split(',')) : [];
      const severities = query.severities ? (Array.isArray(query.severities) ? query.severities : query.severities.split(',')) : [];
      const lifecycles = query.lifecycles ? (Array.isArray(query.lifecycles) ? query.lifecycles : query.lifecycles.split(',')) : [];

      const filters = {
        startDate: query.startDate,
        endDate: query.endDate,
        hazardTypes,
        severities,
        lifecycles,
        country: query.country,
        searchQuery: query.searchQuery || query.q,
        limit: 1000,
        offset: 0,
      };

      const records = getDisasters(filters);

      // Construct CSV
      const headers = [
        'ID',
        'Title',
        'Hazard Type',
        'Severity',
        'Status',
        'Lifecycle',
        'Location',
        'Country',
        'State',
        'Latitude',
        'Longitude',
        'Depth (km)',
        'Timestamp',
        'Start Date',
        'End Date',
        'Intensity / Magnitude',
        'Wind Speed (km/h)',
        'Rainfall (mm)',
        'Affected Population',
        'Casualties',
        'Source',
        'Source URL',
        'Last Updated'
      ];

      const csvRows = [headers.join(',')];

      for (const r of records) {
        const escapeCsv = (val) => {
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        };

        const row = [
          escapeCsv(r.id),
          escapeCsv(r.title),
          escapeCsv(r.hazardType),
          escapeCsv(r.severity),
          escapeCsv(r.status),
          escapeCsv(r.lifecycle),
          escapeCsv(r.location),
          escapeCsv(r.country),
          escapeCsv(r.state || ''),
          r.coordinates.lat,
          r.coordinates.lng,
          r.coordinates.depthKm ?? '',
          escapeCsv(r.timestamp),
          escapeCsv(r.startDate || r.timestamp),
          escapeCsv(r.endDate || ''),
          escapeCsv(r.magnitudeOrIntensity || ''),
          r.windSpeedKmh ?? '',
          r.rainfallMm ?? '',
          r.affectedPopulation !== null && r.affectedPopulation !== undefined ? r.affectedPopulation : 'Unknown',
          r.casualties !== null && r.casualties !== undefined ? r.casualties : 'Unknown',
          escapeCsv(r.source),
          escapeCsv(r.sourceUrl),
          escapeCsv(r.lastUpdated)
        ];
        csvRows.push(row.join(','));
      }

      const csvContent = csvRows.join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="pralay-disasters-${new Date().toISOString().slice(0, 10)}.csv"`);
      res.statusCode = 200;
      res.end(csvContent);
      return true;
    } catch (err) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 500;
      res.end(JSON.stringify({ success: false, error: err.message }));
      return true;
    }
  }

  return false;
}
