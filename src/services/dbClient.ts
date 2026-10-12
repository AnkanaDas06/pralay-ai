import { 
  Incident, 
  HistoricalFilterState, 
  HistoricalStatsResult, 
  SyncLogEntry, 
  DataSourceStatus 
} from '../types/disaster';
import { DEMO_INCIDENTS } from '../data/demoIncidents';

const DB_NAME = 'pralay_historical_db';
const STORE_NAME = 'disasters';
const DB_VERSION = 1;

// Open or initialize IndexedDB fallback cache
function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('hazardType', 'hazardType', { unique: false });
        store.createIndex('severity', 'severity', { unique: false });
        store.createIndex('lifecycle', 'lifecycle', { unique: false });
      }
    };
  });
}

// Save records into IndexedDB cache for offline & reload resilience
export async function cacheRecordsInIndexedDb(records: Incident[]): Promise<void> {
  try {
    const db = await openIndexedDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const r of records) {
      store.put(r);
    }
  } catch (err) {
    console.warn('IndexedDB caching warning:', err);
  }
}

// Retrieve from IndexedDB cache
export async function getRecordsFromIndexedDb(): Promise<Incident[]> {
  try {
    const db = await openIndexedDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

// 1. Fetch filtered disaster records from database
export async function fetchDisastersFromDb(filters: Partial<HistoricalFilterState> & { limit?: number; offset?: number } = {}): Promise<{
  disasters: Incident[];
  count: number;
}> {
  const params = new URLSearchParams();
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.hazardTypes && filters.hazardTypes.length > 0) params.set('hazardTypes', filters.hazardTypes.join(','));
  if (filters.severities && filters.severities.length > 0) params.set('severities', filters.severities.join(','));
  if (filters.lifecycles && filters.lifecycles.length > 0) params.set('lifecycles', filters.lifecycles.join(','));
  if (filters.country && filters.country !== 'All') params.set('country', filters.country);
  if (filters.searchQuery) params.set('searchQuery', filters.searchQuery);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.offset) params.set('offset', String(filters.offset));

  try {
    const res = await fetch(`/api/disasters?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`API HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.disasters)) {
      // Async cache into IndexedDB
      cacheRecordsInIndexedDb(data.disasters);
      return { disasters: data.disasters, count: data.count || data.disasters.length };
    }
    throw new Error('Invalid database response');
  } catch (err) {
    console.warn('Backend API unavailable, falling back to IndexedDB persistent store:', err);
    // Fallback to IndexedDB persistent cache
    const cached = await getRecordsFromIndexedDb();
    if (cached.length > 0) {
      let filtered = cached;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(d => d.title.toLowerCase().includes(q) || d.location.toLowerCase().includes(q));
      }
      if (filters.hazardTypes && filters.hazardTypes.length > 0) {
        filtered = filtered.filter(d => filters.hazardTypes!.includes(d.hazardType));
      }
      if (filters.severities && filters.severities.length > 0) {
        filtered = filtered.filter(d => filters.severities!.includes(d.severity));
      }
      return { disasters: filtered, count: filtered.length };
    }
    // Final emergency fallback to demo
    return { disasters: DEMO_INCIDENTS, count: DEMO_INCIDENTS.length };
  }
}

// 2. Fetch aggregate statistics for historical analytics
export async function fetchHistoricalStatsFromDb(filters: Partial<HistoricalFilterState> = {}): Promise<HistoricalStatsResult> {
  const params = new URLSearchParams();
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.hazardTypes && filters.hazardTypes.length > 0) params.set('hazardTypes', filters.hazardTypes.join(','));
  if (filters.severities && filters.severities.length > 0) params.set('severities', filters.severities.join(','));
  if (filters.lifecycles && filters.lifecycles.length > 0) params.set('lifecycles', filters.lifecycles.join(','));
  if (filters.country && filters.country !== 'All') params.set('country', filters.country);
  if (filters.searchQuery) params.set('searchQuery', filters.searchQuery);

  try {
    const res = await fetch(`/api/disasters/historical-stats?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Stats HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && data.stats) {
      return data.stats;
    }
    throw new Error('Invalid stats payload');
  } catch (err) {
    console.warn('Could not fetch remote stats, computing locally:', err);
    // Compute stats from local records
    const { disasters } = await fetchDisastersFromDb(filters);
    return computeStatsLocally(disasters);
  }
}

// 3. Trigger manual sync across all live & historical providers
export async function triggerLiveDatabaseSync(): Promise<{
  success: boolean;
  totalIngested: number;
  syncTimestamp: string;
  results: { source: string; status: string; count?: number; error?: string; durationMs: number }[];
  recentLogs: SyncLogEntry[];
}> {
  try {
    const res = await fetch('/api/disasters/sync', {
      method: 'POST',
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`Sync HTTP ${res.status}`);
    const data = await res.json();
    return {
      success: true,
      totalIngested: data.syncResult?.totalIngested || 0,
      syncTimestamp: data.syncResult?.syncTimestamp || new Date().toISOString(),
      results: data.syncResult?.results || [],
      recentLogs: data.recentLogs || [],
    };
  } catch (err) {
    return {
      success: false,
      totalIngested: 0,
      syncTimestamp: new Date().toISOString(),
      results: [{ source: 'Sync Service', status: 'failed', error: (err as Error).message, durationMs: 0 }],
      recentLogs: [],
    };
  }
}

// 4. Fetch audit sync logs
export async function fetchSyncLogs(limit = 20): Promise<SyncLogEntry[]> {
  try {
    const res = await fetch(`/api/sync/logs?limit=${limit}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Sync Logs HTTP ${res.status}`);
    const data = await res.json();
    return data.logs || [];
  } catch {
    return [];
  }
}

// 5. Build export URL
export function getCsvExportUrl(filters: Partial<HistoricalFilterState> = {}): string {
  const params = new URLSearchParams();
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.hazardTypes && filters.hazardTypes.length > 0) params.set('hazardTypes', filters.hazardTypes.join(','));
  if (filters.severities && filters.severities.length > 0) params.set('severities', filters.severities.join(','));
  if (filters.lifecycles && filters.lifecycles.length > 0) params.set('lifecycles', filters.lifecycles.join(','));
  if (filters.country && filters.country !== 'All') params.set('country', filters.country);
  if (filters.searchQuery) params.set('searchQuery', filters.searchQuery);
  return `/api/export/csv?${params.toString()}`;
}

// Fallback local stats calculation
function computeStatsLocally(records: Incident[]): HistoricalStatsResult {
  const typeMap: Record<string, number> = {};
  let criticalCount = 0;
  let highCount = 0;
  let moderateCount = 0;
  let lowCount = 0;
  let activeCount = 0;
  let resolvedCount = 0;

  for (const r of records) {
    typeMap[r.hazardType] = (typeMap[r.hazardType] || 0) + 1;
    if (r.severity === 'critical') criticalCount++;
    else if (r.severity === 'high') highCount++;
    else if (r.severity === 'moderate') moderateCount++;
    else lowCount++;

    if (r.lifecycle === 'active') activeCount++;
    else resolvedCount++;
  }

  const typeBreakdown = Object.entries(typeMap).map(([type, count]) => ({
    type: type as any,
    label: type.charAt(0).toUpperCase() + type.slice(1),
    count,
  }));

  return {
    totalEvents: records.length,
    activeCount,
    resolvedCount,
    criticalCount,
    highCount,
    moderateCount,
    lowCount,
    typeBreakdown,
    severityBreakdown: [
      { severity: 'critical', count: criticalCount },
      { severity: 'high', count: highCount },
      { severity: 'moderate', count: moderateCount },
      { severity: 'low', count: lowCount },
    ],
    timeline: [],
  };
}
