import React from 'react';
import { Incident } from '../../types/disaster';
import { 
  X, 
  ExternalLink, 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  Activity,
  Database,
  Clock,
  AlertTriangle,
  Info,
  CheckCheck
} from 'lucide-react';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onFocusMap?: (lat: number, lng: number) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onFocusMap,
}) => {
  if (!incident) return null;

  const severityColor = {
    critical: 'text-red-300 bg-red-950/80 border-red-500/60 font-bold',
    high: 'text-orange-300 bg-orange-950/80 border-orange-500/60 font-bold',
    moderate: 'text-amber-300 bg-amber-950/80 border-amber-500/60 font-bold',
    low: 'text-emerald-300 bg-emerald-950/80 border-emerald-500/60 font-bold',
  }[incident.severity];

  const getProvenanceBadge = () => {
    switch (incident.provenanceType) {
      case 'sensor_observation':
        return {
          label: 'Direct Sensor Observation',
          bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60',
          desc: 'Automated physical telemetry from seismic or satellite instruments.',
        };
      case 'official_warning':
        return {
          label: 'Official Warning Bulletin',
          bg: 'bg-red-950/80 text-red-300 border-red-500/60',
          desc: 'Issued by national civil protection or meteorological agency.',
        };
      case 'official_forecast':
        return {
          label: 'Official Forecast Model',
          bg: 'bg-blue-950/80 text-blue-300 border-blue-500/60',
          desc: 'Atmospheric numerical weather or trajectory prediction.',
        };
      case 'historical_archive':
        return {
          label: 'Historical Official Archive',
          bg: 'bg-purple-950/80 text-purple-300 border-purple-500/60',
          desc: 'Archived benchmark record validated against post-disaster surveys.',
        };
      case 'synthetic_drill':
        return {
          label: 'Synthetic Training Drill',
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500/60',
          desc: 'Simulated exercise scenario generated for offline stress-testing.',
        };
      default:
        return {
          label: incident.status.replace('_', ' ').toUpperCase(),
          bg: 'bg-slate-900 text-slate-300 border-slate-700',
          desc: 'Operational multi-hazard intelligence entry.',
        };
    }
  };

  const prov = getProvenanceBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0b1328] border border-blue-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-blue-900/40 bg-[#0e1935]">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2.5 py-0.5 text-xs uppercase rounded-md border font-mono ${severityColor}`}>
                {incident.severity} SEVERITY
              </span>
              <span className="px-2 py-0.5 text-xs font-mono uppercase bg-[#060b18] text-slate-300 rounded border border-blue-900/40 font-medium">
                {incident.hazardType}
              </span>
              <span className={`px-2 py-0.5 text-xs font-mono uppercase rounded border ${prov.bg}`}>
                {prov.label}
              </span>
              {incident.isDemo && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-950/70 text-amber-300 border border-amber-500/50 rounded font-mono">
                  DEMO SCENARIO
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white leading-tight">
              {incident.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{incident.location} ({incident.country})</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-blue-900/40 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm panel-scrollbar">
          {/* Telemetry Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#060b18] p-3 rounded-xl border border-blue-900/50 font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">COORDINATES</span>
              <span className="font-semibold text-blue-400">
                {incident.coordinates.lat.toFixed(3)}°, {incident.coordinates.lng.toFixed(3)}°
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">INTENSITY / MAG</span>
              <span className="font-semibold text-white">
                {incident.magnitudeOrIntensity || 'Unspecified'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">IMPACT RADIUS</span>
              <span className="font-semibold text-orange-400">
                ~{incident.impactRadiusKm} km
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">OBSERVED TIME</span>
              <span className="text-slate-300 truncate block">
                {new Date(incident.observationTime || incident.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              Operational Situation Overview
            </h4>
            <p className="text-slate-200 leading-relaxed bg-[#060b18] p-3.5 rounded-xl border border-blue-900/40">
              {incident.description}
            </p>
          </div>

          {/* Dedicated Data Provenance & Scientific Audit Panel (Step 2 Requirement) */}
          <div className="p-4 rounded-xl bg-[#070e22] border border-cyan-800/40 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Data Provenance & Scientific Audit Panel
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-600/50 font-bold">
                AUDITED RECORD
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#060b18] border border-blue-900/40">
                <span className="text-slate-400 text-[10px] block uppercase font-medium">Original Data Provider</span>
                <span className="text-white font-semibold font-sans block mt-0.5">{incident.source}</span>
                <span className="text-[11px] text-cyan-400 block truncate mt-0.5">
                  ID: {incident.originalProviderId || incident.providerEventId || incident.id}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#060b18] border border-blue-900/40">
                <span className="text-slate-400 text-[10px] block uppercase font-medium">Epistemic Status</span>
                <span className="text-emerald-400 font-semibold font-sans block mt-0.5">{prov.label}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-sans leading-tight">
                  {prov.desc}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#060b18] border border-blue-900/40">
                <span className="text-slate-400 text-[10px] block uppercase font-medium">Observation / Issue Time</span>
                <span className="text-slate-200 block mt-0.5">
                  Observed: {new Date(incident.observationTime || incident.timestamp).toLocaleString()}
                </span>
                {incident.forecastIssueTime && (
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Valid Window: {new Date(incident.forecastIssueTime).toLocaleDateString()} &mdash; {incident.forecastValidUntil ? new Date(incident.forecastValidUntil).toLocaleDateString() : 'Active'}
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-[#060b18] border border-blue-900/40">
                <span className="text-slate-400 text-[10px] block uppercase font-medium">Last Synchronized</span>
                <span className="text-slate-200 block mt-0.5">
                  {new Date(incident.lastSyncTime || incident.lastUpdated).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Verification: <strong className="text-cyan-300 font-sans">{incident.verificationStatus.replace('_', ' ')}</strong>
                </span>
              </div>
            </div>

            {/* Uncertainty and Missing Fields Disclosures */}
            <div className="p-3 rounded-lg bg-[#060b18] border border-blue-900/40 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Epistemic Boundary & Uncertainty Notes:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                {incident.dataUncertaintyNotes || 'Direct observation recorded by physical sensor network. Earthquakes and geodynamic events cannot be predicted in advance with deterministic certainty.'}
              </p>

              {/* Casualties / Population Status */}
              <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                <span>
                  Casualties: <strong className="text-white">{incident.casualties !== undefined && incident.casualties !== null ? incident.casualties.toLocaleString() : 'Not Officially Surveyed'}</strong>
                </span>
                <span>•</span>
                <span>
                  Affected Pop: <strong className="text-white">{incident.affectedPopulation !== undefined && incident.affectedPopulation !== null ? incident.affectedPopulation.toLocaleString() : 'Unspecified'}</strong>
                </span>
              </div>
            </div>

            {/* Clickable link to official source */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 font-sans">
                Verify original government / agency record:
              </span>
              <a
                href={incident.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:text-white bg-blue-950/80 hover:bg-blue-900/80 border border-cyan-500/50 rounded-lg transition shadow-xs"
              >
                <span>Open Upstream Agency Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Actionable Official Guidance Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Recommended Official Safety Guidance
            </h4>
            <div className="space-y-2">
              {incident.safetyGuidance.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#060b18] border border-blue-900/40 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200 leading-normal font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-4 border-t border-blue-900/40 bg-[#0e1935]">
          <div className="text-xs text-slate-400 font-mono">
            System ID: <span className="text-slate-300">{incident.id}</span>
          </div>
          <div className="flex items-center gap-2">
            {onFocusMap && (
              <button
                onClick={() => {
                  onFocusMap(incident.coordinates.lat, incident.coordinates.lng);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/50 rounded-lg transition"
              >
                Center On Map
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
