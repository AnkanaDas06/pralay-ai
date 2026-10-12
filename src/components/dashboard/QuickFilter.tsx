import React from 'react';
import { FilterState, HazardType, SeverityLevel } from '../../types/disaster';
import { 
  Search, 
  Activity, 
  Wind, 
  Droplets, 
  Flame, 
  Mountain, 
  Globe, 
  X 
} from 'lucide-react';

interface QuickFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export const QuickFilter: React.FC<QuickFilterProps> = ({
  filters,
  onFilterChange,
  totalCount,
  filteredCount,
}) => {
  const hazardButtons: { type: HazardType | 'all'; label: string; icon: React.ReactNode }[] = [
    { type: 'all', label: 'All Hazards', icon: <Globe className="w-3.5 h-3.5" /> },
    { type: 'earthquake', label: 'Seismic', icon: <Activity className="w-3.5 h-3.5 text-blue-600" /> },
    { type: 'cyclone', label: 'Cyclones', icon: <Wind className="w-3.5 h-3.5 text-sky-600" /> },
    { type: 'flood', label: 'Floods', icon: <Droplets className="w-3.5 h-3.5 text-cyan-600" /> },
    { type: 'wildfire', label: 'Wildfires', icon: <Flame className="w-3.5 h-3.5 text-orange-600" /> },
    { type: 'landslide', label: 'Landslides', icon: <Mountain className="w-3.5 h-3.5 text-amber-600" /> },
  ];

  const handleHazardToggle = (hazard: HazardType | 'all') => {
    if (hazard === 'all') {
      onFilterChange({ ...filters, hazardTypes: [] });
    } else {
      const exists = filters.hazardTypes.includes(hazard);
      const nextHazards = exists 
        ? filters.hazardTypes.filter(h => h !== hazard)
        : [...filters.hazardTypes, hazard];
      onFilterChange({ ...filters, hazardTypes: nextHazards });
    }
  };

  const handleSearchChange = (query: string) => {
    onFilterChange({ ...filters, searchQuery: query });
  };

  const handleSeverityToggle = (sev: SeverityLevel) => {
    const exists = filters.severities.includes(sev);
    const nextSeverities = exists
      ? filters.severities.filter(s => s !== sev)
      : [...filters.severities, sev];
    onFilterChange({ ...filters, severities: nextSeverities });
  };

  const clearAllFilters = () => {
    onFilterChange({
      hazardTypes: [],
      severities: [],
      region: 'All',
      searchQuery: '',
      timeRangeHours: 24,
      onlyCritical: false,
    });
  };

  const isFiltered = filters.hazardTypes.length > 0 || 
    filters.severities.length > 0 || 
    filters.region !== 'All' || 
    filters.searchQuery !== '' || 
    filters.onlyCritical;

  return (
    <div className="bg-[#0b1328] p-3.5 rounded-xl border border-blue-900/40 shadow-xl space-y-3 text-slate-100">
      {/* Search Bar & Region Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search country, province, sea basin, or incident name..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#060b18] border border-blue-900/50 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Region Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={filters.region}
            onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
            className="bg-[#060b18] border border-blue-900/50 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="All">All Regions (Global)</option>
            <option value="India">India / South Asia</option>
            <option value="East Asia">East Asia / Japan</option>
            <option value="Southeast Asia">Southeast Asia / Indonesia</option>
            <option value="North America">North America</option>
            <option value="Europe">Europe & Mediterranean</option>
          </select>

          {/* Time Window Dropdown */}
          <select
            value={filters.timeRangeHours}
            onChange={(e) => onFilterChange({ ...filters, timeRangeHours: Number(e.target.value) })}
            className="bg-[#060b18] border border-blue-900/50 text-xs text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value={24}>Past 24 Hours</option>
            <option value={72}>Past 72 Hours</option>
            <option value={168}>Past 7 Days</option>
            <option value={720}>Past 30 Days</option>
          </select>
        </div>
      </div>

      {/* Hazard Type Buttons & Severity Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-blue-900/40 text-xs">
        {/* Hazards */}
        <div className="flex flex-wrap items-center gap-1.5">
          {hazardButtons.map((hb) => {
            const isAll = hb.type === 'all';
            const isSelected = isAll ? filters.hazardTypes.length === 0 : filters.hazardTypes.includes(hb.type as HazardType);

            return (
              <button
                key={hb.type}
                onClick={() => handleHazardToggle(hb.type)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  isSelected
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 font-semibold shadow-xs'
                    : 'bg-[#060b18] text-slate-300 border border-blue-900/40 hover:bg-[#101a35] hover:text-white'
                }`}
              >
                {hb.icon}
                <span>{hb.label}</span>
              </button>
            );
          })}
        </div>

        {/* Severity Toggles */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400 mr-1 hidden md:inline font-semibold">SEVERITY:</span>
          {(['critical', 'high', 'moderate', 'low'] as SeverityLevel[]).map((sev) => {
            const isSelected = filters.severities.includes(sev);
            const colorClass = {
              critical: isSelected ? 'bg-red-950/80 text-red-300 border-red-500/60 font-bold' : 'text-slate-400 hover:text-red-300 border-transparent',
              high: isSelected ? 'bg-orange-950/80 text-orange-300 border-orange-500/60 font-bold' : 'text-slate-400 hover:text-orange-300 border-transparent',
              moderate: isSelected ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 font-bold' : 'text-slate-400 hover:text-amber-300 border-transparent',
              low: isSelected ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 font-bold' : 'text-slate-400 hover:text-emerald-300 border-transparent',
            }[sev];

            return (
              <button
                key={sev}
                onClick={() => handleSeverityToggle(sev)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono uppercase border transition ${colorClass}`}
              >
                {sev}
              </button>
            );
          })}

          {isFiltered && (
            <button
              onClick={clearAllFilters}
              className="ml-1 text-[11px] text-blue-400 hover:text-blue-300 hover:underline font-mono font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Showing X of Y label */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-0.5">
        <span>Displaying {filteredCount} of {totalCount} total normalized events</span>
        {filters.region !== 'All' && <span className="text-blue-400 font-semibold">Filtering: {filters.region}</span>}
      </div>
    </div>
  );
};
