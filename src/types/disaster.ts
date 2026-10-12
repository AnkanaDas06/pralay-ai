export type HazardType = 
  | 'earthquake'
  | 'cyclone'
  | 'flood'
  | 'wildfire'
  | 'tsunami'
  | 'landslide'
  | 'severe_weather'
  | 'extreme_temp'
  | 'volcano';

export type SeverityLevel = 'critical' | 'high' | 'moderate' | 'low';

export type EventStatus = 
  | 'observed_event' 
  | 'official_warning' 
  | 'model_risk_estimate' 
  | 'experimental_prediction';

export type EventLifecycle = 'active' | 'monitoring' | 'resolved' | 'historical';

export interface Coordinates {
  lat: number;
  lng: number;
  depthKm?: number;
}

export interface CycloneTrackPoint {
  lat: number;
  lng: number;
  timestamp: string; // ISO string
  windSpeedKmh?: number;
  pressureMb?: number;
  category?: string; // e.g. "Super Cyclonic Storm", "Category 5", "Deep Depression"
  stage?: string;
}

export interface Incident {
  id: string; // Composite deduplication key (e.g. usgs-us7000xxxx, ibtracs-2020136N10088)
  providerEventId?: string;
  title: string;
  hazardType: HazardType;
  severity: SeverityLevel;
  status: EventStatus;
  lifecycle?: EventLifecycle; // 'active' | 'monitoring' | 'resolved' | 'historical'
  location: string;
  country: string;
  state?: string;
  district?: string;
  region: string;
  coordinates: Coordinates;
  timestamp: string; // ISO string (start or observed time)
  startDate?: string; // ISO string
  endDate?: string; // ISO string (if resolved or concluded)
  magnitudeOrIntensity?: string; // e.g., "M 7.8", "Cat 5 (260 km/h)", "Rainfall 240mm"
  magnitudeValue?: number;
  windSpeedKmh?: number;
  rainfallMm?: number;
  depthKm?: number;
  affectedPopulation?: number | null; // Null or unknown when not verified
  casualties?: number | null; // Null or unknown when not verified
  impactRadiusKm: number;
  source: string;
  sourceUrl: string;
  verificationStatus: 'verified_official' | 'automated_sensor' | 'preliminary' | 'simulated_demo';
  description: string;
  safetyGuidance: string[];
  lastUpdated: string;
  lastSyncTime?: string;
  cycloneTracks?: CycloneTrackPoint[];
  isDemo?: boolean;
}

export interface RiskAssessment {
  overallScore: number; // 0 - 100
  riskLevel: SeverityLevel;
  confidenceIndicator: 'high' | 'moderate' | 'low' | 'insufficient_data';
  factors: {
    name: string;
    weight: number;
    value: number; // 0 - 100
    description: string;
  }[];
  contributingHazards: HazardType[];
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendedActions: string[];
  formulaExplanation: string;
}

export interface EmergencyResource {
  id: string;
  name: string;
  category: 'hospital' | 'ndrf_base' | 'fire_station' | 'shelter' | 'police' | 'helpline';
  location: string;
  state?: string;
  country: string;
  coordinates: Coordinates;
  contactNumber: string;
  is24x7: boolean;
  capabilities: string[];
  verifiedDate: string;
}

export interface FilterState {
  hazardTypes: HazardType[];
  severities: SeverityLevel[];
  region: string;
  searchQuery: string;
  timeRangeHours: number; // 24, 72, 168 (7d), 720 (30d)
  onlyCritical: boolean;
}

export interface HistoricalFilterState {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  hazardTypes: HazardType[];
  severities: SeverityLevel[];
  lifecycles: EventLifecycle[];
  country: string;
  searchQuery: string;
}

export interface DataSourceStatus {
  name: string;
  endpoint: string;
  status: 'operational' | 'degraded' | 'offline' | 'mock_fallback';
  lastChecked: string;
  latencyMs: number;
  incidentCount: number;
}

export interface SyncLogEntry {
  id: number;
  sourceName: string;
  syncTimestamp: string;
  status: 'success' | 'failed' | 'partial';
  recordsIngested: number;
  recordsUpdated: number;
  errorMessage?: string | null;
  durationMs: number;
}

export interface HistoricalStatsResult {
  totalEvents: number;
  activeCount: number;
  resolvedCount: number;
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  lowCount: number;
  typeBreakdown: { type: HazardType; label: string; count: number }[];
  severityBreakdown: { severity: SeverityLevel; count: number }[];
  timeline: { date: string; count: number; earthquakes: number; cyclones: number; floods: number; wildfires: number; other: number }[];
  peakMagnitude?: string;
}
