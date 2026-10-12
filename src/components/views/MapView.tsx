import React, { useState } from 'react';
import { Incident, EmergencyResource, FilterState } from '../../types/disaster';
import { DisasterMap } from '../map/DisasterMap';
import { QuickFilter } from '../dashboard/QuickFilter';
import { 
  Crosshair, 
  Globe,
  Wind,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface MapViewProps {
  incidents: Incident[];
  filteredIncidents: Incident[];
  emergencyResources: EmergencyResource[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  focusedCoordinates?: { lat: number; lng: number; zoom?: number } | null;
  onFocusMap: (lat: number, lng: number, zoom?: number) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  incidents,
  filteredIncidents,
  emergencyResources,
  selectedIncident,
  onSelectIncident,
  filters,
  onFilterChange,
  focusedCoordinates,
  onFocusMap,
}) => {
  const [includeHistorical, setIncludeHistorical] = useState<boolean>(true);

  // Compute active vs historical for display
  const activeCount = filteredIncidents.filter(i => i.lifecycle === 'active').length;
  const historicalCount = filteredIncidents.filter(i => i.lifecycle === 'historical' || i.lifecycle === 'resolved').length;

  const displayedIncidents = includeHistorical 
    ? filteredIncidents 
    : filteredIncidents.filter(i => i.lifecycle === 'active');

  return (
    <div className="space-y-3">
      {/* Header Bar */}
      <div className="p-3.5 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-100">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Global Geospatial Command Map
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-cyan-300 border border-cyan-500/50 font-bold">
            {activeCount} LIVE INCIDENTS
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700 font-semibold">
            {historicalCount} HISTORICAL RECORDS
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-slate-300 hover:text-white transition">
            <input
              type="checkbox"
              checked={includeHistorical}
              onChange={e => setIncludeHistorical(e.target.checked)}
              className="accent-cyan-500"
            />
            <span className="text-[11px] font-medium">Include Historical Archive Markers</span>
          </label>
        </div>
      </div>

      {/* Top Map Filter Strip */}
      <QuickFilter
        filters={filters}
        onFilterChange={onFilterChange}
        totalCount={incidents.length}
        filteredCount={displayedIncidents.length}
      />

      {/* Main Full-Height Map Container */}
      <div className="relative">
        <DisasterMap
          incidents={displayedIncidents}
          emergencyResources={emergencyResources}
          selectedIncident={selectedIncident}
          onSelectIncident={onSelectIncident}
          focusedCoordinates={focusedCoordinates}
          heightClass="h-[680px]"
        />

        {/* Selected Incident Floating Tactical HUD (if an incident is clicked) */}
        {selectedIncident && (
          <div className="absolute top-16 right-3 z-20 w-80 max-w-[calc(100vw-2rem)] bg-[#0b1328]/95 backdrop-blur-xl border border-blue-900/60 rounded-xl p-4 shadow-2xl animate-in slide-in-from-right-4 text-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${
                selectedIncident.lifecycle === 'active' 
                  ? 'bg-red-950/60 text-red-300 border-red-500/50' 
                  : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}>
                {selectedIncident.lifecycle === 'active' ? 'LIVE MONITORING' : 'HISTORICAL DOSSIER'}
              </span>
              <button
                onClick={() => onSelectIncident(null)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                [CLOSE]
              </button>
            </div>

            <h4 className="font-bold text-sm text-white mb-1 leading-snug">
              {selectedIncident.title}
            </h4>
            <p className="text-xs text-slate-300 mb-2">
              {selectedIncident.location} ({selectedIncident.country})
            </p>

            <div className="space-y-1.5 text-xs bg-[#060b18] p-2.5 rounded-lg border border-blue-900/50 font-mono mb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Severity:</span>
                <span className="font-bold uppercase text-red-400">{selectedIncident.severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Intensity:</span>
                <span className="text-cyan-400 font-bold">{selectedIncident.magnitudeOrIntensity || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="text-slate-200">{selectedIncident.timestamp.slice(0, 10)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Impact Radius:</span>
                <span className="text-orange-400 font-bold">~{selectedIncident.impactRadiusKm} km</span>
              </div>
              {selectedIncident.cycloneTracks && selectedIncident.cycloneTracks.length > 0 && (
                <div className="flex justify-between text-cyan-300">
                  <span>IBTrACS Path:</span>
                  <span className="font-bold">{selectedIncident.cycloneTracks.length} Track Points</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Source:</span>
                <span className="text-slate-300 truncate max-w-[140px]">{selectedIncident.source}</span>
              </div>
            </div>

            <button
              onClick={() => onFocusMap(selectedIncident.coordinates.lat, selectedIncident.coordinates.lng, 8)}
              className="w-full py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition shadow-md text-center flex items-center justify-center gap-1.5"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Center & Zoom In</span>
            </button>
          </div>
        )}
      </div>

      {/* Geospatial Guidance Legend */}
      <div className="p-3.5 bg-[#0b1328] rounded-xl border border-blue-900/40 shadow-xl text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="flex items-start gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1"></span>
          <div>
            <strong className="text-white block font-mono text-[11px]">CRITICAL LIVE HAZARD</strong>
            <span className="text-slate-400 text-[11px]">Active high-magnitude earthquake or severe storm.</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 mt-1"></span>
          <div>
            <strong className="text-white block font-mono text-[11px]">HIGH RISK ALERT</strong>
            <span className="text-slate-400 text-[11px]">Elevated hazard propagation or active red alert.</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-300 shrink-0 mt-1"></span>
          <div>
            <strong className="text-white block font-mono text-[11px]">HISTORICAL ARCHIVE</strong>
            <span className="text-slate-400 text-[11px]">Archived verified past disaster (never shown as live emergency).</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-4 h-0.5 bg-cyan-400 shrink-0 mt-2"></span>
          <div>
            <strong className="text-cyan-300 block font-mono text-[11px]">IBTrACS STORM TRACK</strong>
            <span className="text-slate-400 text-[11px]">Official multi-point cyclone trajectory & landfall points.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
