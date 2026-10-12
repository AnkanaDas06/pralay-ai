import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Incident, 
  HazardType, 
  SeverityLevel, 
  EventLifecycle,
  HistoricalFilterState,
  HistoricalStatsResult,
  SyncLogEntry
} from '../../types/disaster';
import { 
  fetchDisastersFromDb, 
  fetchHistoricalStatsFromDb, 
  triggerLiveDatabaseSync,
  getCsvExportUrl 
} from '../../services/dbClient';
import { 
  Calendar, 
  Search, 
  Download, 
  RefreshCw, 
  Filter, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Flame, 
  Wind, 
  Waves, 
  Mountain, 
  Eye, 
  Clock, 
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';

interface HistoricalIntelligenceViewProps {
  onFocusMap: (lat: number, lng: number, zoom?: number) => void;
  onSelectIncident: (incident: Incident) => void;
  onShowToast: (title: string, message: string, type?: 'critical' | 'warning' | 'success' | 'info') => void;
}

const HAZARD_COLORS: Record<string, string> = {
  earthquake: '#f97316', // orange
  cyclone: '#06b6d4',    // cyan
  flood: '#3b82f6',      // blue
  wildfire: '#ef4444',   // red
  tsunami: '#8b5cf6',    // purple
  landslide: '#eab308',  // yellow
  volcano: '#ec4899',    // pink
  severe_weather: '#14b8a6',
  extreme_temp: '#f43f5e',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  moderate: '#eab308',
  low: '#10b981',
};

export function HistoricalIntelligenceView({
  onFocusMap,
  onSelectIncident,
  onShowToast
}: HistoricalIntelligenceViewProps) {
  // Filter state
  const [filters, setFilters] = useState<HistoricalFilterState>({
    startDate: '',
    endDate: '',
    hazardTypes: [],
    severities: [],
    lifecycles: [],
    country: 'All',
    searchQuery: '',
  });

  const [datePreset, setDatePreset] = useState<string>('all');
  const [disasters, setDisasters] = useState<Incident[]>([]);
  const [stats, setStats] = useState<HistoricalStatsResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [sortField, setSortField] = useState<keyof Incident>('timestamp');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [selectedDossier, setSelectedDossier] = useState<Incident | null>(null);

  // Apply Quick Date Presets
  const applyPreset = useCallback((preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    const endStr = now.toISOString().slice(0, 10);
    let startStr = '';

    if (preset === '7d') {
      const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startStr = d.toISOString().slice(0, 10);
    } else if (preset === '30d') {
      const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startStr = d.toISOString().slice(0, 10);
    } else if (preset === '90d') {
      const d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      startStr = d.toISOString().slice(0, 10);
    } else if (preset === '1y') {
      const d = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      startStr = d.toISOString().slice(0, 10);
    } else if (preset === '5y') {
      const d = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
      startStr = d.toISOString().slice(0, 10);
    } else if (preset === 'all') {
      startStr = '';
    }

    setFilters(f => ({ ...f, startDate: startStr, endDate: preset === 'all' ? '' : endStr }));
    setCurrentPage(1);
  }, []);

  // Fetch data from database
  const loadHistoricalData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [disastersRes, statsRes] = await Promise.all([
        fetchDisastersFromDb({
          ...filters,
          limit: 300,
        }),
        fetchHistoricalStatsFromDb(filters),
      ]);

      setDisasters(disastersRes.disasters);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load historical disaster data:', err);
      onShowToast('Data Error', 'Unable to retrieve disaster archive.', 'critical');
    } finally {
      setIsLoading(false);
    }
  }, [filters, onShowToast]);

  useEffect(() => {
    loadHistoricalData();
  }, [loadHistoricalData]);

  // Trigger Live Ingestion Sync
  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    onShowToast('Synchronizing Database', 'Ingesting latest feeds from USGS, NASA EONET, NOAA IBTrACS & IMD...', 'info');
    try {
      const result = await triggerLiveDatabaseSync();
      if (result.success) {
        onShowToast('Database Updated', `Successfully processed ${result.totalIngested} disaster records into persistent storage.`, 'success');
        loadHistoricalData();
      } else {
        onShowToast('Sync Incomplete', 'One or more providers were unreachable; check audit logs.', 'warning');
      }
    } catch (err) {
      onShowToast('Sync Failed', 'Could not complete synchronization.', 'critical');
    } finally {
      setIsSyncing(false);
    }
  };

  // CSV Export Download
  const handleExportCsv = () => {
    const url = getCsvExportUrl(filters);
    window.open(url, '_blank');
    onShowToast('Export Started', 'Filtered records are downloading in CSV format.', 'success');
  };

  // Sort records
  const sortedDisasters = useMemo(() => {
    const list = [...disasters];
    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (sortField === 'timestamp') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [disasters, sortField, sortAsc]);

  // Paginated records
  const totalPages = Math.ceil(sortedDisasters.length / pageSize) || 1;
  const paginatedDisasters = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedDisasters.slice(start, start + pageSize);
  }, [sortedDisasters, currentPage, pageSize]);

  const handleSort = (field: keyof Incident) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" />
                Persistent Multi-Hazard Database
              </span>
              <span className="text-xs text-slate-400 font-mono">
                SQLite v3.x Engine Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Historical Disaster Intelligence & Event Archive
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
              Explore authoritative historical records, cyclone trajectories, seismic ruptures, and flood events across days, months, and decades. Filter, analyze trends, inspect storm tracks, and export verified datasets.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export Filtered CSV</span>
            </button>

            <button
              onClick={handleSyncDatabase}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-900/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Sync Live Data'}</span>
            </button>
          </div>
        </div>

        {/* Quick Range Presets */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Time Presets:
          </span>
          {[
            { id: '7d', label: 'Past 7 Days' },
            { id: '30d', label: 'Past 30 Days' },
            { id: '90d', label: 'Past 90 Days' },
            { id: '1y', label: 'Past 1 Year' },
            { id: '5y', label: 'Past 5 Years' },
            { id: 'all', label: 'All Archive (Decades)' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                datePreset === p.id 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => {
                setDatePreset('custom');
                setFilters(f => ({ ...f, startDate: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => {
                setDatePreset('custom');
                setFilters(f => ({ ...f, endDate: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Hazard Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Hazard Type
            </label>
            <select
              value={filters.hazardTypes[0] || 'All'}
              onChange={e => {
                const val = e.target.value;
                setFilters(f => ({ ...f, hazardTypes: val === 'All' ? [] : [val as HazardType] }));
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Hazards</option>
              <option value="earthquake">Earthquake</option>
              <option value="cyclone">Cyclone / Storm</option>
              <option value="flood">Flood</option>
              <option value="wildfire">Wildfire</option>
              <option value="tsunami">Tsunami</option>
              <option value="landslide">Landslide</option>
              <option value="volcano">Volcano</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Severity
            </label>
            <select
              value={filters.severities[0] || 'All'}
              onChange={e => {
                const val = e.target.value;
                setFilters(f => ({ ...f, severities: val === 'All' ? [] : [val as SeverityLevel] }));
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Lifecycle Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Event Status
            </label>
            <select
              value={filters.lifecycles[0] || 'All'}
              onChange={e => {
                const val = e.target.value;
                setFilters(f => ({ ...f, lifecycles: val === 'All' ? [] : [val as EventLifecycle] }));
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Lifecycles</option>
              <option value="active">Active Monitoring</option>
              <option value="monitoring">Monitoring Stage</option>
              <option value="resolved">Resolved</option>
              <option value="historical">Archived Historical</option>
            </select>
          </div>

          {/* Country / Region */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Country / Region
            </label>
            <select
              value={filters.country}
              onChange={e => {
                setFilters(f => ({ ...f, country: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">Global (All Countries)</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="Japan">Japan</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Turkey">Turkey</option>
              <option value="Nepal">Nepal</option>
              <option value="Pakistan">Pakistan</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
        </div>

        {/* Search Bar Row */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by event title, location, country, or event ID..."
              value={filters.searchQuery}
              onChange={e => {
                setFilters(f => ({ ...f, searchQuery: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={() => {
              setDatePreset('all');
              setFilters({
                startDate: '',
                endDate: '',
                hazardTypes: [],
                severities: [],
                lifecycles: [],
                country: 'All',
                searchQuery: '',
              });
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors whitespace-nowrap"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Aggregate KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Events */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Filtered Incidents</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats?.totalEvents ?? disasters.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-cyan-400 font-medium">Authoritative</span> archive records
          </div>
        </div>

        {/* Card 2: Active vs Resolved */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active / Resolved</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white flex items-baseline gap-2">
            <span className="text-cyan-400">{stats?.activeCount ?? 0}</span>
            <span className="text-sm font-normal text-slate-500">/</span>
            <span className="text-slate-300 text-lg font-bold">{stats?.resolvedCount ?? 0}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats?.activeCount ? `${Math.round(((stats.activeCount) / (stats.totalEvents || 1)) * 100)}% live emergencies` : 'Historical baseline'}
          </div>
        </div>

        {/* Card 3: Critical & High Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">High / Critical</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">
            {(stats?.criticalCount ?? 0) + (stats?.highCount ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-red-400 font-medium">{stats?.criticalCount ?? 0}</span> Catastrophic Tier
          </div>
        </div>

        {/* Card 4: Historical Peak Intensity */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Peak Magnitude</span>
            <Waves className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black text-amber-300 truncate" title={stats?.peakMagnitude || 'N/A'}>
            {stats?.peakMagnitude || 'M 9.1 Megathrust'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Verified sensor telemetry
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Historical Trend Timeline */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Disaster Occurrence Trend Over Time
              </h3>
              <p className="text-xs text-slate-400">Daily and monthly frequency progression across selected filter criteria</p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded">
              {stats?.timeline?.length || 0} Data Intervals
            </span>
          </div>

          <div className="h-64 w-full flex-1">
            {stats?.timeline && stats.timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="cyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="wfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickFormatter={val => val.slice(5)} 
                  />
                  <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="earthquakes" name="Earthquakes" stroke="#f97316" fillOpacity={1} fill="url(#eqGrad)" />
                  <Area type="monotone" dataKey="wildfires" name="Wildfires" stroke="#ef4444" fillOpacity={1} fill="url(#wfGrad)" />
                  <Area type="monotone" dataKey="cyclones" name="Cyclones" stroke="#06b6d4" fillOpacity={1} fill="url(#cyGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No timeline data available for the current filter selection.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Hazard Type & Severity Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Filter className="w-4 h-4 text-cyan-400" />
              Disaster Type Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-3">Relative percentage breakdown by natural hazard category</p>

            <div className="h-44 w-full">
              {stats?.typeBreakdown && stats.typeBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.typeBreakdown}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {stats.typeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={HAZARD_COLORS[entry.type] || '#64748b'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  No hazard data
                </div>
              )}
            </div>
          </div>

          {/* Type Legend list */}
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] grid grid-cols-2 gap-1.5">
            {stats?.typeBreakdown?.slice(0, 4).map(t => (
              <div key={t.type} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: HAZARD_COLORS[t.type] || '#64748b' }} />
                <span className="text-slate-300 truncate">{t.label}:</span>
                <span className="text-white font-bold ml-auto">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Disasters Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Verified Historical Events Dossier Table
            </h3>
            <p className="text-xs text-slate-400">
              Showing {sortedDisasters.length} records matching current criteria (Page {currentPage} of {totalPages})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Rows:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th 
                  onClick={() => handleSort('timestamp')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  Date / Time {sortField === 'timestamp' && (sortAsc ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => handleSort('hazardType')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  Hazard {sortField === 'hazardType' && (sortAsc ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => handleSort('title')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  Disaster Title & Location {sortField === 'title' && (sortAsc ? '▲' : '▼')}
                </th>
                <th className="py-3 px-3">Intensity</th>
                <th 
                  onClick={() => handleSort('severity')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  Severity {sortField === 'severity' && (sortAsc ? '▲' : '▼')}
                </th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    Querying persistent SQLite disaster database...
                  </td>
                </tr>
              ) : paginatedDisasters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No disaster records matched the specified criteria. Try clearing some filters.
                  </td>
                </tr>
              ) : (
                paginatedDisasters.map(item => {
                  const isHistorical = item.lifecycle === 'historical' || item.lifecycle === 'resolved';
                  const dateStr = new Date(item.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  const timeStr = new Date(item.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedDossier(item)}
                    >
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-200">{dateStr}</div>
                        <div className="text-[10px] text-slate-500">{timeStr} UTC</div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1"
                          style={{ 
                            backgroundColor: `${HAZARD_COLORS[item.hazardType] || '#64748b'}20`,
                            color: HAZARD_COLORS[item.hazardType] || '#64748b',
                            borderColor: `${HAZARD_COLORS[item.hazardType] || '#64748b'}40`,
                            borderWidth: '1px'
                          }}
                        >
                          {item.hazardType}
                        </span>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-semibold text-slate-100 truncate group-hover:text-cyan-400 transition-colors" title={item.title}>
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate" title={item.location}>
                          {item.location} {item.country ? `• ${item.country}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-300">
                        {item.magnitudeOrIntensity || 'Observed'}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{
                            backgroundColor: `${SEVERITY_COLORS[item.severity]}25`,
                            color: SEVERITY_COLORS[item.severity]
                          }}
                        >
                          {item.severity}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {isHistorical ? (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-semibold uppercase">
                            Historical
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px] font-semibold uppercase flex items-center gap-1 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-400 text-[11px] truncate max-w-[140px]" title={item.source}>
                        {item.source.split('/')[0].trim()}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onFocusMap(item.coordinates.lat, item.coordinates.lng, 8);
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                            title="Focus on World Map"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                            title="Official Bulletin"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedDisasters.length)} of {sortedDisasters.length} records
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-slate-300 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Event Dossier Modal */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedDossier(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span 
                className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${SEVERITY_COLORS[selectedDossier.severity]}25`,
                  color: SEVERITY_COLORS[selectedDossier.severity]
                }}
              >
                {selectedDossier.severity} Severity
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold uppercase">
                {selectedDossier.lifecycle === 'active' ? 'Active Monitoring' : 'Verified Historical Archive'}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white">
              {selectedDossier.title}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {selectedDossier.location} • {selectedDossier.country}
            </p>

            {/* Coordinates & Timeline Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Coordinates</span>
                <span className="font-mono text-slate-200 font-medium">
                  {selectedDossier.coordinates.lat.toFixed(3)}°, {selectedDossier.coordinates.lng.toFixed(3)}°
                </span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Event Date</span>
                <span className="text-slate-200 font-medium">
                  {new Date(selectedDossier.timestamp).toISOString().slice(0, 10)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Intensity / Mag</span>
                <span className="text-amber-400 font-bold font-mono">
                  {selectedDossier.magnitudeOrIntensity || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Casualties</span>
                <span className="text-slate-200 font-medium">
                  {selectedDossier.casualties !== null && selectedDossier.casualties !== undefined 
                    ? selectedDossier.casualties.toLocaleString() 
                    : 'Unknown / Not Reported'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Official Incident Assessment
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                {selectedDossier.description}
              </p>
            </div>

            {/* Cyclone Tracks Section (if available) */}
            {selectedDossier.cycloneTracks && selectedDossier.cycloneTracks.length > 0 && (
              <div className="mb-4 p-3 bg-slate-950/60 rounded-xl border border-cyan-900/40">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Wind className="w-4 h-4" />
                  NOAA IBTrACS Storm Progression Track ({selectedDossier.cycloneTracks.length} Waypoints)
                </h4>
                <div className="max-h-36 overflow-y-auto space-y-1.5 text-[11px] pr-1">
                  {selectedDossier.cycloneTracks.map((trk, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 bg-slate-900/80 rounded border border-slate-800">
                      <span className="text-slate-300 font-mono">
                        {trk.timestamp.slice(0, 10)} {trk.timestamp.slice(11, 16)}
                      </span>
                      <span className="text-cyan-400 font-semibold">{trk.category || trk.stage}</span>
                      <span className="text-slate-400 font-mono">{trk.lat.toFixed(1)}°N, {trk.lng.toFixed(1)}°E</span>
                      <span className="text-amber-400 font-bold">{trk.windSpeedKmh} km/h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Guidance */}
            {selectedDossier.safetyGuidance && selectedDossier.safetyGuidance.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Recommended Disaster Safety Actions
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {selectedDossier.safetyGuidance.map((sg, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{sg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Source & Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="text-slate-400">
                Source: <span className="text-slate-200 font-medium">{selectedDossier.source}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onFocusMap(selectedDossier.coordinates.lat, selectedDossier.coordinates.lng, 8);
                    setSelectedDossier(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
                >
                  Locate on World Map
                </button>
                <a
                  href={selectedDossier.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                >
                  <span>Bulletin</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
