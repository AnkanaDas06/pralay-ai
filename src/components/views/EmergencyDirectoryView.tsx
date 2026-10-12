import React, { useState } from 'react';
import { EMERGENCY_RESOURCES, SAFETY_CHECKLISTS } from '../../data/emergencyResources';
import { 
  LifeBuoy, 
  PhoneCall, 
  ShieldCheck, 
  Search, 
  MapPin, 
  Crosshair, 
  CheckCircle2, 
  AlertTriangle
} from 'lucide-react';

interface EmergencyDirectoryViewProps {
  onFocusMap: (lat: number, lng: number, zoom?: number) => void;
}

export const EmergencyDirectoryView: React.FC<EmergencyDirectoryViewProps> = ({
  onFocusMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeGuideIndex, setActiveGuideIndex] = useState<number>(0);

  const filteredResources = EMERGENCY_RESOURCES.filter((res) => {
    if (selectedCategory !== 'all' && res.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = res.name.toLowerCase().includes(q) ||
        res.location.toLowerCase().includes(q) ||
        res.capabilities.some(c => c.toLowerCase().includes(q)) ||
        (res.state && res.state.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'helpline', label: 'Helplines' },
    { id: 'hospital', label: 'Trauma Hospitals' },
    { id: 'ndrf_base', label: 'NDRF Battalions' },
    { id: 'shelter', label: 'Cyclone / Flood Shelters' },
    { id: 'fire_station', label: 'Fire & Rescue' },
  ];

  return (
    <div className="space-y-4 text-slate-100">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LifeBuoy className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Emergency Resources & Operational Directory
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Verified directory of apex trauma hospitals, specialized NDRF disaster response bases, multi-hazard cyclone shelters, and emergency hotlines.
          </p>
        </div>

        {/* Life Safety Evacuation Notice */}
        <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Road Advisory:</strong> Physical evacuation transit corridors must be verified with district police; bridges and culverts may be compromised.
          </span>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="p-3 bg-[#0b1328] rounded-xl border border-blue-900/40 shadow-xl space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search facility name, district, or emergency capability (e.g. 'Trauma', 'Sundarbans', 'Boat Teams')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#060b18] border border-blue-900/50 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-[#060b18] text-slate-400 hover:bg-[#101a35] border border-blue-900/40 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredResources.map((res) => {
          const categoryBadge = {
            hospital: 'bg-blue-950/60 text-blue-300 border-blue-500/40',
            ndrf_base: 'bg-orange-950/60 text-orange-300 border-orange-500/40',
            shelter: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
            fire_station: 'bg-red-950/60 text-red-300 border-red-500/40',
            helpline: 'bg-sky-950/60 text-sky-300 border-sky-500/40',
            police: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40',
          }[res.category];

          return (
            <div
              key={res.id}
              className="p-4 rounded-xl bg-[#0b1328] border border-blue-900/40 hover:border-blue-700/60 transition shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold font-mono uppercase rounded border ${categoryBadge}`}>
                    {res.category.replace('_', ' ')}
                  </span>
                  {res.is24x7 && (
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/40 font-bold">
                      24×7 ACTIVE
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-white mb-1 leading-snug">
                  {res.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{res.location} {res.state ? `(${res.state})` : ''}</span>
                </div>

                {/* Capabilities Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {res.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[10px] bg-[#060b18] text-slate-300 rounded border border-blue-900/40 font-mono"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Strip: Phone & Map Center */}
              <div className="pt-3 border-t border-blue-900/30 flex items-center justify-between text-xs">
                <a
                  href={`tel:${res.contactNumber.split('/')[0].trim()}`}
                  className="flex items-center gap-1.5 font-mono font-bold text-blue-400 hover:text-blue-300"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                  <span>{res.contactNumber}</span>
                </a>

                <button
                  onClick={() => onFocusMap(res.coordinates.lat, res.coordinates.lng, 10)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-400 transition"
                  title="Locate facility on geospatial map"
                >
                  <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                  <span>Locate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Operational Safety Action Guides */}
      <div className="p-5 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Standard Operating Safety Protocols & Checklists
          </h3>
        </div>

        {/* Guide Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {SAFETY_CHECKLISTS.map((guide, idx) => (
            <button
              key={guide.hazard}
              onClick={() => setActiveGuideIndex(idx)}
              className={`p-2.5 rounded-lg text-xs font-semibold text-left transition border ${
                activeGuideIndex === idx
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-md font-bold'
                  : 'bg-[#060b18] text-slate-400 border-blue-900/40 hover:bg-[#101a35] hover:text-white'
              }`}
            >
              <span className="block font-bold">{guide.hazard}</span>
              <span className="text-[10px] text-slate-400 font-mono">Action Guide</span>
            </button>
          ))}
        </div>

        {/* Selected Guide Content */}
        {SAFETY_CHECKLISTS[activeGuideIndex] && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Immediate Steps */}
            <div className="p-4 rounded-xl bg-[#060b18] border border-blue-900/40">
              <h4 className="font-bold text-red-400 uppercase font-mono mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Immediate Life-Safety Steps (During Event)
              </h4>
              <ul className="space-y-2">
                {SAFETY_CHECKLISTS[activeGuideIndex].immediateSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-200">
                    <span className="w-4 h-4 rounded-full bg-red-950/80 text-red-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px] border border-red-500/50">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Aftermath Steps */}
            <div className="p-4 rounded-xl bg-[#060b18] border border-blue-900/40">
              <h4 className="font-bold text-emerald-400 uppercase font-mono mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Post-Event Recovery & Survival Steps
              </h4>
              <ul className="space-y-2">
                {SAFETY_CHECKLISTS[activeGuideIndex].aftermathSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-200">
                    <span className="w-4 h-4 rounded-full bg-emerald-950/80 text-emerald-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px] border border-emerald-500/50">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
