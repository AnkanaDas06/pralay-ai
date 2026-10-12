import React, { useState } from 'react';
import { Incident, SeverityLevel, HazardType } from '../../types/disaster';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Radio, 
  Search, 
  ExternalLink, 
  Crosshair, 
  CheckCheck, 
  Check, 
  Clock, 
  MapPin, 
  Sparkles
} from 'lucide-react';
import { requestNotificationPermission, getNotificationPermission } from '../../services/notificationService';
import { audioAlertService } from '../../services/audioService';

interface AlertCenterViewProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onFocusMap: (lat: number, lng: number) => void;
  onSimulateAlert: () => void;
  readIncidentIds: Set<string>;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const AlertCenterView: React.FC<AlertCenterViewProps> = ({
  incidents,
  onSelectIncident,
  onFocusMap,
  onSimulateAlert,
  readIncidentIds,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all'>('all');
  const [selectedHazard, setSelectedHazard] = useState<HazardType | 'all'>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());
  const [soundEnabled, setSoundEnabled] = useState(audioAlertService.isEnabled());

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
  };

  const handleToggleSound = () => {
    const next = audioAlertService.toggle();
    setSoundEnabled(next);
  };

  // Filter alerts
  const filteredAlerts = incidents.filter((incident) => {
    if (selectedSeverity !== 'all' && incident.severity !== selectedSeverity) return false;
    if (selectedHazard !== 'all' && incident.hazardType !== selectedHazard) return false;
    if (unreadOnly && readIncidentIds.has(incident.id)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = incident.title.toLowerCase().includes(q) ||
        incident.location.toLowerCase().includes(q) ||
        incident.country.toLowerCase().includes(q) ||
        incident.source.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const unreadCount = incidents.filter(i => !readIncidentIds.has(i.id)).length;

  return (
    <div className="space-y-4">
      {/* Alert Engine Command Header */}
      <div className="p-4 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Critical Alerts & Real-Time Alert Engine
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-blue-950/60 text-blue-300 border border-blue-500/50">
              {unreadCount} UNREAD
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Normalized early warning alerts synthesized from USGS seismology, NASA EONET orbital sensors, IMD cyclone bulletins, and CWC hydrological gauges.
          </p>
        </div>

        {/* Action Controls: Notification Permission, Sound, Simulate Alert */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {notificationPermission !== 'granted' ? (
            <button
              onClick={handleRequestPermission}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-md"
              title="Enable browser notifications for urgent disaster alerts"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Browser Alerts</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-semibold">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Browser Alerts Active</span>
            </div>
          )}

          <button
            onClick={handleToggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              soundEnabled
                ? 'bg-blue-950/60 text-blue-300 border-blue-500/50'
                : 'bg-[#060b18] text-slate-400 border-blue-900/40 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          <button
            onClick={onSimulateAlert}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/40 transition shadow-md ml-auto md:ml-0"
            title="Trigger a simulated critical incident for live demonstration"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Simulate Incoming Alert</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-[#0b1328] rounded-xl border border-blue-900/40 shadow-xl space-y-3 text-slate-100">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alert headlines, cities, states, or agencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#060b18] border border-blue-900/50 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Severity filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="bg-[#060b18] border border-blue-900/50 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Alerts</option>
              <option value="high">High Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="low">Low Risk</option>
            </select>

            {/* Hazard type filter */}
            <select
              value={selectedHazard}
              onChange={(e) => setSelectedHazard(e.target.value as any)}
              className="bg-[#060b18] border border-blue-900/50 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Hazard Types</option>
              <option value="earthquake">Earthquakes</option>
              <option value="cyclone">Cyclones</option>
              <option value="flood">Floods</option>
              <option value="wildfire">Wildfires</option>
              <option value="landslide">Landslides</option>
              <option value="extreme_temp">Heatwave/Extreme Temp</option>
            </select>

            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition ${
                unreadOnly
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 font-bold'
                  : 'bg-[#060b18] text-slate-400 border-blue-900/40 hover:text-white'
              }`}
            >
              Unread Only
            </button>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 transition font-mono ml-1 font-semibold"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Mark All Read</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-[#0b1328] rounded-xl border border-blue-900/40 text-slate-400 text-sm">
            No active disaster alerts matching your filter criteria.
          </div>
        ) : (
          filteredAlerts.map((incident) => {
            const isRead = readIncidentIds.has(incident.id);
            const severityColor = {
              critical: 'border-l-4 border-l-red-500 bg-red-950/20',
              high: 'border-l-4 border-l-orange-500 bg-orange-950/20',
              moderate: 'border-l-4 border-l-amber-500 bg-amber-950/15',
              low: 'border-l-4 border-l-emerald-500 bg-emerald-950/15',
            }[incident.severity];

            const badgeBg = {
              critical: 'bg-red-950/80 text-red-300 border-red-500/60 font-bold',
              high: 'bg-orange-950/80 text-orange-300 border-orange-500/60 font-bold',
              moderate: 'bg-amber-950/80 text-amber-300 border-amber-500/60 font-bold',
              low: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 font-bold',
            }[incident.severity];

            return (
              <div
                key={incident.id}
                className={`p-4 rounded-xl bg-[#0b1328] border border-blue-900/40 hover:border-blue-700/60 transition shadow-md ${severityColor} ${
                  !isRead ? 'ring-1 ring-blue-500' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-[10px] uppercase rounded-md font-mono border ${badgeBg}`}>
                      {incident.severity}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#060b18] text-slate-300 rounded border border-blue-900/40 font-medium">
                      {incident.hazardType}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(incident.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" title="Unread alert"></span>
                    )}
                    {incident.isDemo && (
                      <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 bg-amber-950/60 text-amber-300 border border-amber-500/40 rounded">
                        DEMO DATA
                      </span>
                    )}
                  </div>

                  {/* Top Right Controls */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => {
                        onFocusMap(incident.coordinates.lat, incident.coordinates.lng);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/50 rounded-lg transition"
                    >
                      <Crosshair className="w-3 h-3 text-blue-400" />
                      <span>Locate on Map</span>
                    </button>
                    {!isRead && (
                      <button
                        onClick={() => onMarkAsRead(incident.id)}
                        className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-white transition"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>

                {/* Headline */}
                <h3 
                  onClick={() => onSelectIncident(incident)}
                  className="text-base font-bold text-white hover:text-blue-400 cursor-pointer transition leading-snug"
                >
                  {incident.title}
                </h3>

                {/* Location & Intensity */}
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 mb-2 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{incident.location} ({incident.country})</span>
                  </span>
                  {incident.magnitudeOrIntensity && (
                    <span className="text-blue-400 font-bold">
                      {incident.magnitudeOrIntensity}
                    </span>
                  )}
                  <span className="text-slate-400">
                    Radius: ~{incident.impactRadiusKm}km
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {incident.description}
                </p>

                {/* Actionable Safety Guidance Pill */}
                {incident.safetyGuidance.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-[#060b18] border border-blue-900/40 text-xs text-slate-300 mb-3">
                    <strong className="text-emerald-400 block mb-1 font-mono text-[11px]">
                      DIRECTIVE / SAFETY GUIDANCE:
                    </strong>
                    <p className="text-slate-300">
                      {incident.safetyGuidance[0]}
                    </p>
                  </div>
                )}

                {/* Source attribution & Link */}
                <div className="flex items-center justify-between pt-2 border-t border-blue-900/30 text-[11px] text-slate-400">
                  <span className="truncate max-w-[280px]">Source: {incident.source} &bull; Last Updated: {new Date(incident.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <a
                    href={incident.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:underline font-medium"
                  >
                    <span>Official Report</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
