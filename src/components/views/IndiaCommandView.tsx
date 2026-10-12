import React, { useState } from 'react';
import { Incident } from '../../types/disaster';
import { INDIA_STATES_DATA, INDIA_OFFICIAL_LINKS } from '../../data/indiaStateData';
import { 
  Flag, 
  PhoneCall, 
  ExternalLink, 
  Crosshair
} from 'lucide-react';

interface IndiaCommandViewProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onFocusMap: (lat: number, lng: number, zoom?: number) => void;
}

export const IndiaCommandView: React.FC<IndiaCommandViewProps> = ({
  incidents,
  onSelectIncident,
  onFocusMap,
}) => {
  const [selectedStateId, setSelectedStateId] = useState<string>('west-bengal');

  const selectedState = INDIA_STATES_DATA.find(s => s.id === selectedStateId) || INDIA_STATES_DATA[0];

  // Filter incidents for India and specifically this state
  const indiaIncidents = incidents.filter(i => 
    i.country.toLowerCase().includes('india') || 
    i.region.toLowerCase().includes('south asia')
  );

  return (
    <div className="space-y-4 text-slate-100">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flag className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              India Sector Mode & Disaster Operations
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-orange-950/60 text-orange-300 border border-orange-500/50">
              NATIONAL DISASTER GRID
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Coordinated monitoring covering the Himalayan seismic arc (Zone V/IV), Bay of Bengal & Arabian Sea cyclone corridors, and riverine flood basins.
          </p>
        </div>

        {/* Quick Indian National Helpline 112 & 1078 Badge */}
        <div className="flex items-center gap-2 bg-[#060b18] p-2.5 rounded-xl border border-blue-900/50 font-mono text-xs">
          <PhoneCall className="w-4 h-4 text-emerald-400 animate-pulse" />
          <div>
            <span className="text-[10px] text-slate-400 block">NATIONAL HELPLINE</span>
            <span className="font-bold text-emerald-400">112 (ERSS) / 1078 (NDMA)</span>
          </div>
        </div>
      </div>

      {/* State Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {INDIA_STATES_DATA.map((state) => (
          <button
            key={state.id}
            onClick={() => {
              setSelectedStateId(state.id);
              onFocusMap(state.coordinates.lat, state.coordinates.lng, state.coordinates.zoom);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
              selectedStateId === state.id
                ? 'bg-orange-950/60 text-orange-300 border-orange-500/50 shadow-md font-bold'
                : 'bg-[#0b1328] text-slate-400 border-blue-900/40 hover:text-white hover:bg-[#101a35]'
            }`}
          >
            <span>{state.name}</span>
            {state.id === 'west-bengal' && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-900/80 text-orange-300 font-mono font-bold">
                FOCUS
              </span>
            )}
          </button>
        ))}
      </div>

      {/* State Profile Details & Map Jump Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: State Vulnerability Profile */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-900/40">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  {selectedState.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  (Capital: {selectedState.capital})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Authority: <strong className="text-blue-300">{selectedState.sdmaName}</strong>
              </p>
            </div>

            <button
              onClick={() => onFocusMap(selectedState.coordinates.lat, selectedState.coordinates.lng, selectedState.coordinates.zoom)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition self-start sm:self-auto shadow-md"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Center Map on {selectedState.name}</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[#060b18] border border-blue-900/50">
              <span className="text-[10px] text-slate-400 block">SEISMIC ZONING</span>
              <span className="font-bold text-amber-400">{selectedState.seismicZones[0]}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#060b18] border border-blue-900/50">
              <span className="text-[10px] text-slate-400 block">COASTLINE</span>
              <span className="font-bold text-blue-400">{selectedState.coastalLengthKm ? `${selectedState.coastalLengthKm} km` : 'Inland Basin'}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#060b18] border border-blue-900/50">
              <span className="text-[10px] text-slate-400 block">SDMA HELPLINE</span>
              <span className="font-bold text-emerald-400">{selectedState.sdmaHelpline}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#060b18] border border-blue-900/50">
              <span className="text-[10px] text-slate-400 block">NDRF UNIT</span>
              <span className="font-bold text-slate-200 truncate">{selectedState.ndrfBattalionAssigned.split('(')[0]}</span>
            </div>
          </div>

          {/* District-Level Vulnerability & Real Conditions */}
          <div>
            <h4 className="text-xs font-bold font-mono uppercase text-white mb-2.5 tracking-wider">
              District Geomorphological & Hazard Hotspots
            </h4>
            <div className="space-y-2">
              {selectedState.keyDistricts.map((d, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#060b18] border border-blue-900/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{d.district}</span>
                      <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-blue-950/60 text-blue-300 border border-blue-500/50 font-semibold">
                        {d.vulnerability}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{d.details}</p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded self-start sm:self-auto shrink-0 ${
                    d.recentStatus === 'Elevated Watch' 
                      ? 'bg-orange-950/60 text-orange-300 border border-orange-500/50'
                      : d.recentStatus === 'Advisory Active'
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-500/50'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50'
                  }`}>
                    {d.recentStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Events in State + Emergency Links */}
        <div className="space-y-4">
          {/* Active Events in India / State */}
          <div className="p-4 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl">
            <h4 className="text-xs font-bold font-mono uppercase text-white mb-3 tracking-wider flex items-center justify-between">
              <span>Sector Events Telemetry</span>
              <span className="text-[10px] text-blue-400 font-bold">{indiaIncidents.length} in India</span>
            </h4>

            {indiaIncidents.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">
                No active severe incidents reported in the Indian sector currently.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 panel-scrollbar">
                {indiaIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      onSelectIncident(inc);
                      onFocusMap(inc.coordinates.lat, inc.coordinates.lng, 7);
                    }}
                    className="p-2.5 rounded-lg bg-[#060b18] border border-blue-900/40 hover:border-blue-500/60 cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                        inc.severity === 'critical' ? 'bg-red-950/80 text-red-300 border border-red-500/50' : 'bg-orange-950/80 text-orange-300 border border-orange-500/50'
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{inc.hazardType}</span>
                    </div>
                    <h5 className="font-semibold text-white leading-tight line-clamp-1">{inc.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{inc.location}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Official Indian Agencies Directory Links */}
          <div className="p-4 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl">
            <h4 className="text-xs font-bold font-mono uppercase text-white mb-2.5 tracking-wider">
              Statutory Disaster Portals
            </h4>
            <div className="space-y-2 text-xs">
              {INDIA_OFFICIAL_LINKS.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between p-2 rounded-lg bg-[#060b18] hover:bg-[#101a35] transition border border-blue-900/40 group"
                >
                  <div>
                    <strong className="text-slate-200 group-hover:text-blue-300 block">{link.name}</strong>
                    <span className="text-[11px] text-slate-400">{link.desc}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 shrink-0 mt-1" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
