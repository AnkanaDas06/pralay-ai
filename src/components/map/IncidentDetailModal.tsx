import React from 'react';
import { Incident } from '../../types/disaster';
import { 
  X, 
  ExternalLink, 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  Activity
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

  const statusLabel = {
    observed_event: 'Observed Sensor Event',
    official_warning: 'Official Warning Bulletin',
    model_risk_estimate: 'Model Risk Estimate',
    experimental_prediction: 'Experimental Prediction',
  }[incident.status];

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
              <span className="px-2 py-0.5 text-xs font-mono text-slate-400 bg-[#060b18] rounded border border-blue-900/40">
                {statusLabel}
              </span>
              {incident.isDemo && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-950/70 text-amber-300 border border-amber-500/50 rounded font-mono">
                  DEMO EVENT
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
              <span className="text-slate-400 block text-[11px]">TIMESTAMP</span>
              <span className="text-slate-300">
                {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

          {/* Provenance & Source Attribution */}
          <div className="p-3 bg-[#060b18] rounded-xl border border-blue-900/40 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="block font-semibold text-white">Data Source: {incident.source}</span>
              <span className="text-[11px] text-slate-400">Last Synchronized: {new Date(incident.lastUpdated).toLocaleString()}</span>
            </div>
            <a
              href={incident.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/50 rounded-lg transition self-start sm:self-auto shadow-xs"
            >
              <span>View Official Report</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-4 border-t border-blue-900/40 bg-[#0e1935]">
          <div className="text-xs text-slate-400 font-mono">
            ID: <span className="text-slate-300">{incident.id}</span>
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
