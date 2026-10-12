import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-cyan-900/30 bg-[#050b1a]/85 backdrop-blur-md text-slate-400 text-xs py-4 px-4 sm:px-6 relative z-20">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Project identity & Hackathon accreditation */}
        <div className="flex items-center gap-2 text-center md:text-left">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong className="text-slate-200">PRALAY AI</strong> &mdash; Built for Autonomous Disaster Resilience & Multi-Hazard Intelligence Hackathon 2026.
          </span>
        </div>

        {/* Center: Authoritative Legal & Life Safety Notice */}
        <div className="flex items-center gap-2 text-[11px] text-amber-300/90 bg-amber-950/30 px-3 py-1 rounded-lg border border-amber-800/40 max-w-xl text-center">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span>
            <strong>Public Emergency Notice:</strong> In active life-threatening crises, strictly follow directives from local emergency services, NDMA, and police authorities.
          </span>
        </div>

        {/* Right: Data Providers */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span>USGS</span>
          <span>•</span>
          <span>NASA EONET</span>
          <span>•</span>
          <span>IMD / NDMA</span>
          <span>•</span>
          <span>Open-Meteo</span>
        </div>
      </div>
    </footer>
  );
};
