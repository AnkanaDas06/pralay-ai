import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'pralay_disasters.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance = null;

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS disasters (
      id TEXT PRIMARY KEY,
      provider_event_id TEXT,
      title TEXT NOT NULL,
      hazard_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      lifecycle TEXT NOT NULL,
      location TEXT NOT NULL,
      country TEXT NOT NULL,
      state TEXT,
      district TEXT,
      region TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      depth_km REAL,
      timestamp TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      magnitude_or_intensity TEXT,
      magnitude_value REAL,
      wind_speed_kmh REAL,
      rainfall_mm REAL,
      affected_population INTEGER,
      casualties INTEGER,
      impact_radius_km REAL,
      source TEXT NOT NULL,
      source_url TEXT NOT NULL,
      verification_status TEXT NOT NULL,
      description TEXT NOT NULL,
      safety_guidance TEXT NOT NULL,
      last_updated TEXT NOT NULL,
      last_sync_time TEXT NOT NULL,
      cyclone_tracks TEXT,
      is_demo INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_disasters_timestamp ON disasters(timestamp);
    CREATE INDEX IF NOT EXISTS idx_disasters_hazard_type ON disasters(hazard_type);
    CREATE INDEX IF NOT EXISTS idx_disasters_severity ON disasters(severity);
    CREATE INDEX IF NOT EXISTS idx_disasters_lifecycle ON disasters(lifecycle);
    CREATE INDEX IF NOT EXISTS idx_disasters_country ON disasters(country);

    CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_name TEXT NOT NULL,
      sync_timestamp TEXT NOT NULL,
      status TEXT NOT NULL,
      records_ingested INTEGER NOT NULL DEFAULT 0,
      records_updated INTEGER NOT NULL DEFAULT 0,
      error_message TEXT,
      duration_ms INTEGER NOT NULL DEFAULT 0
    );
  `);
}

export function upsertDisaster(incident) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO disasters (
      id, provider_event_id, title, hazard_type, severity, status, lifecycle,
      location, country, state, district, region, latitude, longitude, depth_km,
      timestamp, start_date, end_date, magnitude_or_intensity, magnitude_value,
      wind_speed_kmh, rainfall_mm, affected_population, casualties, impact_radius_km,
      source, source_url, verification_status, description, safety_guidance,
      last_updated, last_sync_time, cyclone_tracks, is_demo
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      severity = excluded.severity,
      status = excluded.status,
      lifecycle = excluded.lifecycle,
      location = excluded.location,
      country = excluded.country,
      state = COALESCE(excluded.state, disasters.state),
      district = COALESCE(excluded.district, disasters.district),
      region = excluded.region,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      depth_km = COALESCE(excluded.depth_km, disasters.depth_km),
      last_updated = excluded.last_updated,
      magnitude_or_intensity = COALESCE(excluded.magnitude_or_intensity, disasters.magnitude_or_intensity),
      magnitude_value = COALESCE(excluded.magnitude_value, disasters.magnitude_value),
      wind_speed_kmh = COALESCE(excluded.wind_speed_kmh, disasters.wind_speed_kmh),
      rainfall_mm = COALESCE(excluded.rainfall_mm, disasters.rainfall_mm),
      affected_population = COALESCE(excluded.affected_population, disasters.affected_population),
      casualties = COALESCE(excluded.casualties, disasters.casualties),
      impact_radius_km = excluded.impact_radius_km,
      safety_guidance = excluded.safety_guidance,
      description = excluded.description,
      last_sync_time = excluded.last_sync_time,
      cyclone_tracks = COALESCE(excluded.cyclone_tracks, disasters.cyclone_tracks)
  `);

  stmt.run(
    incident.id,
    incident.providerEventId || incident.id,
    incident.title,
    incident.hazardType,
    incident.severity,
    incident.status,
    incident.lifecycle || 'active',
    incident.location,
    incident.country,
    incident.state || null,
    incident.district || null,
    incident.region,
    incident.coordinates.lat,
    incident.coordinates.lng,
    incident.coordinates.depthKm ?? incident.depthKm ?? null,
    incident.timestamp,
    incident.startDate || incident.timestamp,
    incident.endDate || null,
    incident.magnitudeOrIntensity || null,
    incident.magnitudeValue ?? null,
    incident.windSpeedKmh ?? null,
    incident.rainfallMm ?? null,
    incident.affectedPopulation ?? null,
    incident.casualties ?? null,
    incident.impactRadiusKm || 50,
    incident.source,
    incident.sourceUrl,
    incident.verificationStatus || 'verified_official',
    incident.description,
    JSON.stringify(incident.safetyGuidance || []),
    incident.lastUpdated || new Date().toISOString(),
    incident.lastSyncTime || new Date().toISOString(),
    incident.cycloneTracks ? JSON.stringify(incident.cycloneTracks) : null,
    incident.isDemo ? 1 : 0
  );
}

export function getDisasters(filters = {}) {
  const db = getDatabase();
  const conditions = [];
  const params = [];

  if (filters.startDate) {
    conditions.push("timestamp >= ?");
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push("timestamp <= ?");
    params.push(filters.endDate + 'T23:59:59.999Z');
  }
  if (filters.hazardTypes && filters.hazardTypes.length > 0) {
    const placeholders = filters.hazardTypes.map(() => '?').join(',');
    conditions.push(`hazard_type IN (${placeholders})`);
    params.push(...filters.hazardTypes);
  }
  if (filters.severities && filters.severities.length > 0) {
    const placeholders = filters.severities.map(() => '?').join(',');
    conditions.push(`severity IN (${placeholders})`);
    params.push(...filters.severities);
  }
  if (filters.lifecycles && filters.lifecycles.length > 0) {
    const placeholders = filters.lifecycles.map(() => '?').join(',');
    conditions.push(`lifecycle IN (${placeholders})`);
    params.push(...filters.lifecycles);
  }
  if (filters.country && filters.country !== 'All') {
    conditions.push("country LIKE ?");
    params.push(`%${filters.country}%`);
  }
  if (filters.searchQuery && filters.searchQuery.trim()) {
    conditions.push("(title LIKE ? OR location LIKE ? OR country LIKE ? OR id LIKE ?)");
    const query = `%${filters.searchQuery.trim()}%`;
    params.push(query, query, query, query);
  }
  if (filters.isDemo !== undefined) {
    conditions.push("is_demo = ?");
    params.push(filters.isDemo ? 1 : 0);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = Math.min(Number(filters.limit) || 200, 1000);
  const offset = Number(filters.offset) || 0;

  const query = `
    SELECT * FROM disasters
    ${whereClause}
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params);
  return rows.map(mapRowToIncident);
}

export function getHistoricalStats(filters = {}) {
  const db = getDatabase();
  const conditions = [];
  const params = [];

  if (filters.startDate) {
    conditions.push("timestamp >= ?");
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push("timestamp <= ?");
    params.push(filters.endDate + 'T23:59:59.999Z');
  }
  if (filters.hazardTypes && filters.hazardTypes.length > 0) {
    const placeholders = filters.hazardTypes.map(() => '?').join(',');
    conditions.push(`hazard_type IN (${placeholders})`);
    params.push(...filters.hazardTypes);
  }
  if (filters.severities && filters.severities.length > 0) {
    const placeholders = filters.severities.map(() => '?').join(',');
    conditions.push(`severity IN (${placeholders})`);
    params.push(...filters.severities);
  }
  if (filters.country && filters.country !== 'All') {
    conditions.push("country LIKE ?");
    params.push(`%${filters.country}%`);
  }
  if (filters.searchQuery && filters.searchQuery.trim()) {
    conditions.push("(title LIKE ? OR location LIKE ? OR country LIKE ? OR id LIKE ?)");
    const q = `%${filters.searchQuery.trim()}%`;
    params.push(q, q, q, q);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 1. Overall counts
  const countRow = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN lifecycle = 'active' THEN 1 ELSE 0 END) as active_count,
      SUM(CASE WHEN lifecycle IN ('resolved', 'historical') THEN 1 ELSE 0 END) as resolved_count,
      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_count,
      SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_count,
      SUM(CASE WHEN severity = 'moderate' THEN 1 ELSE 0 END) as moderate_count,
      SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_count,
      MAX(magnitude_or_intensity) as peak_magnitude
    FROM disasters
    ${whereClause}
  `).get(...params);

  // 2. Type breakdown
  const typeRows = db.prepare(`
    SELECT hazard_type, COUNT(*) as count
    FROM disasters
    ${whereClause}
    GROUP BY hazard_type
    ORDER BY count DESC
  `).all(...params);

  // 3. Timeline trends (aggregated by month or day)
  const timelineRows = db.prepare(`
    SELECT 
      SUBSTR(timestamp, 1, 10) as date,
      COUNT(*) as count,
      SUM(CASE WHEN hazard_type = 'earthquake' THEN 1 ELSE 0 END) as earthquakes,
      SUM(CASE WHEN hazard_type = 'cyclone' THEN 1 ELSE 0 END) as cyclones,
      SUM(CASE WHEN hazard_type = 'flood' THEN 1 ELSE 0 END) as floods,
      SUM(CASE WHEN hazard_type = 'wildfire' THEN 1 ELSE 0 END) as wildfires,
      SUM(CASE WHEN hazard_type NOT IN ('earthquake', 'cyclone', 'flood', 'wildfire') THEN 1 ELSE 0 END) as other
    FROM disasters
    ${whereClause}
    GROUP BY SUBSTR(timestamp, 1, 10)
    ORDER BY date ASC
    LIMIT 100
  `).all(...params);

  return {
    totalEvents: countRow?.total || 0,
    activeCount: countRow?.active_count || 0,
    resolvedCount: countRow?.resolved_count || 0,
    criticalCount: countRow?.critical_count || 0,
    highCount: countRow?.high_count || 0,
    moderateCount: countRow?.moderate_count || 0,
    lowCount: countRow?.low_count || 0,
    peakMagnitude: countRow?.peak_magnitude || 'N/A',
    typeBreakdown: typeRows.map(r => ({
      type: r.hazard_type,
      label: formatHazardLabel(r.hazard_type),
      count: r.count,
    })),
    severityBreakdown: [
      { severity: 'critical', count: countRow?.critical_count || 0 },
      { severity: 'high', count: countRow?.high_count || 0 },
      { severity: 'moderate', count: countRow?.moderate_count || 0 },
      { severity: 'low', count: countRow?.low_count || 0 },
    ],
    timeline: timelineRows.map(r => ({
      date: r.date,
      count: r.count,
      earthquakes: r.earthquakes || 0,
      cyclones: r.cyclones || 0,
      floods: r.floods || 0,
      wildfires: r.wildfires || 0,
      other: r.other || 0,
    })),
  };
}

export function getDisasterById(id) {
  const db = getDatabase();
  const row = db.prepare("SELECT * FROM disasters WHERE id = ?").get(id);
  return row ? mapRowToIncident(row) : null;
}

export function logSyncRecord(log) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO sync_logs (source_name, sync_timestamp, status, records_ingested, records_updated, error_message, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    log.sourceName,
    log.syncTimestamp || new Date().toISOString(),
    log.status,
    log.recordsIngested || 0,
    log.recordsUpdated || 0,
    log.errorMessage || null,
    log.durationMs || 0
  );
}

export function getSyncLogs(limit = 20) {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT * FROM sync_logs
    ORDER BY id DESC
    LIMIT ?
  `).all(limit);

  return rows.map(r => ({
    id: r.id,
    sourceName: r.source_name,
    syncTimestamp: r.sync_timestamp,
    status: r.status,
    recordsIngested: r.records_ingested,
    recordsUpdated: r.records_updated,
    errorMessage: r.error_message,
    durationMs: r.duration_ms,
  }));
}

function mapRowToIncident(row) {
  let safetyGuidance = [];
  try {
    safetyGuidance = JSON.parse(row.safety_guidance || '[]');
  } catch {
    safetyGuidance = [];
  }

  let cycloneTracks = undefined;
  if (row.cyclone_tracks) {
    try {
      cycloneTracks = JSON.parse(row.cyclone_tracks);
    } catch {
      cycloneTracks = undefined;
    }
  }

  return {
    id: row.id,
    providerEventId: row.provider_event_id,
    title: row.title,
    hazardType: row.hazard_type,
    severity: row.severity,
    status: row.status,
    lifecycle: row.lifecycle,
    location: row.location,
    country: row.country,
    state: row.state,
    district: row.district,
    region: row.region,
    coordinates: {
      lat: row.latitude,
      lng: row.longitude,
      depthKm: row.depth_km ?? undefined,
    },
    timestamp: row.timestamp,
    startDate: row.start_date || row.timestamp,
    endDate: row.end_date || undefined,
    magnitudeOrIntensity: row.magnitude_or_intensity || undefined,
    magnitudeValue: row.magnitude_value ?? undefined,
    windSpeedKmh: row.wind_speed_kmh ?? undefined,
    rainfallMm: row.rainfall_mm ?? undefined,
    depthKm: row.depth_km ?? undefined,
    affectedPopulation: row.affected_population,
    casualties: row.casualties,
    impactRadiusKm: row.impact_radius_km,
    source: row.source,
    sourceUrl: row.source_url,
    verificationStatus: row.verification_status,
    description: row.description,
    safetyGuidance,
    lastUpdated: row.last_updated,
    lastSyncTime: row.last_sync_time,
    cycloneTracks,
    isDemo: row.is_demo === 1,
  };
}

function formatHazardLabel(type) {
  const map = {
    earthquake: 'Earthquakes',
    cyclone: 'Cyclones & Storms',
    flood: 'Floods & Rainfall',
    wildfire: 'Wildfires',
    tsunami: 'Tsunamis',
    landslide: 'Landslides',
    severe_weather: 'Severe Weather',
    extreme_temp: 'Extreme Temperature',
    volcano: 'Volcanoes',
  };
  return map[type] || type;
}
