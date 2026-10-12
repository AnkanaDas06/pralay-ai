import React, { useState } from 'react';
import { Incident } from '../../types/disaster';
import { 
  Activity, 
  Wind, 
  Droplets, 
  Flame, 
  Mountain, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Crosshair
} from 'lucide-react';

interface IncidentFeedProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onFocusMap: (lat: number, lng: number) => void;
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onFocusMap,
}) => {
  const [tab, setTab] = useState<'all' | 'critical' | 'india' | 'seismic'>('all');

  const filteredIncidents = incidents.filter((inc) => {
    if (tab === 'critical') return inc.severity === 'critical';
    if (tab === 'india') return inc.country.toLowerCase().includes('india') || inc.region.toLowerCase().includes('south asia');
    if (tab === 'seismic') return inc.hazardType === 'earthquake';
    return true;
  });

  const getHazardIcon = (hazard: string) => {
    switch (hazard) {
      case 'earthquake': return <Activity className="w-3.5 h-3.5 text-blue-600" />;
      case 'cyclone': return <Wind className="w-3.5 h-3.5 text-sky-600" />;
      case 'flood': return <Droplets className="w-3.5 h-3.5 text-cyan-600" />;
      case 'wildfire': return <Flame className="w-3.5 h-3.5 text-orange-600" />;
      case 'landslide': return <Mountain className="w-3.5 h-3.5 text-amber-600" />;
      default: return <ShieldAlert className="w-3.5 h-3.5 text-red-600" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-950/80 text-red-300 border border-red-500/50 font-bold';
      case 'high':
        return 'bg-orange-950/80 text-orange-300 border border-orange-500/50 font-bold';
      case 'moderate':
        return 'bg-amber-950/80 text-amber-300 border border-amber-500/50 font-bold';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 font-bold';
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0b1328] rounded-xl border border-blue-900/40 shadow-xl overflow-hidden text-slate-100">
      {/* Header with Sub-tabs */}
      <div className="p-3.5 border-b border-blue-900/40 bg-[#0e1935]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wide">
              Live Incident Feed
            </h3>
          </div>
          <span className="text-[11px] font-mono text-blue-300 font-medium">
            {filteredIncidents.length} Events
          </span>
        </div>

        {/* Filter subtabs */}
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#060b18] border border-blue-900/50 rounded-lg text-[11px] font-mono">
          <button
            onClick={() => setTab('all')}
            className={`py-1 rounded-md text-center transition ${tab === 'all' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setTab('critical')}
            className={`py-1 rounded-md text-center transition ${tab === 'critical' ? 'bg-red-950/60 text-red-300 border border-red-500/50 font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Critical
          </button>
          <button
            onClick={() => setTab('india')}
            className={`py-1 rounded-md text-center transition ${tab === 'india' ? 'bg-orange-950/60 text-orange-300 border border-orange-500/50 font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
          >
            India
          </button>
          <button
            onClick={() => setTab('seismic')}
            className={`py-1 rounded-md text-center transition ${tab === 'seismic' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Seismic
          </button>
        </div>
      </div>

      {/* Incident Scroll List */}
      <div className="flex-1 overflow-y-auto divide-y divide-blue-950/60 p-1 panel-scrollbar">
        {filteredIncidents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No incidents matching current telemetry filter criteria.
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isSelected = selectedIncident?.id === incident.id;

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className={`p-3 transition-all duration-150 cursor-pointer rounded-lg hover:bg-[#101a35] ${
                  isSelected ? 'bg-[#132247] border-l-4 border-l-blue-500 shadow-md' : ''
                }`}
              >
                {/* Meta Row */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-1.5 py-0.5 text-[10px] uppercase rounded-md font-mono ${getSeverityBadge(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-300">
                      {getHazardIcon(incident.hazardType)}
                      <span className="capitalize">{incident.hazardType}</span>
                    </span>
                    {incident.isDemo && (
                      <span className="px-1 py-0.2 text-[9px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 rounded font-mono">
                        DEMO
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatTimeAgo(incident.timestamp)}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-xs font-semibold text-slate-100 leading-snug line-clamp-2 hover:text-blue-300 transition-colors">
                  {incident.title}
                </h4>

                {/* Location & Intensity */}
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{incident.location}</span>
                  </span>

                  {incident.magnitudeOrIntensity && (
                    <span className="font-mono text-blue-400 shrink-0 font-bold ml-2">
                      {incident.magnitudeOrIntensity}
                    </span>
                  )}
                </div>

                {/* Bottom Action strip */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-blue-900/30 text-[10px] font-mono text-slate-400">
                  <span className="truncate">Src: {incident.source.split(' ')[0]}</span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFocusMap(incident.coordinates.lat, incident.coordinates.lng);
                      onSelectIncident(incident);
                    }}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition font-sans font-medium"
                    title="Center map on this incident"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Locate</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
