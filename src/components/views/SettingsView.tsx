import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Globe, 
  Sparkles, 
  RotateCcw,
  Radio
} from 'lucide-react';
import { requestNotificationPermission, getNotificationPermission } from '../../services/notificationService';
import { audioAlertService } from '../../services/audioService';

interface SettingsViewProps {
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  preferredRegion: string;
  onSelectPreferredRegion: (region: string) => void;
  refreshIntervalSeconds: number;
  onSetRefreshInterval: (sec: number) => void;
  onResetPreferences: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDemoMode,
  onToggleDemoMode,
  preferredRegion,
  onSelectPreferredRegion,
  refreshIntervalSeconds,
  onSetRefreshInterval,
  onResetPreferences,
}) => {
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());
  const [soundEnabled, setSoundEnabled] = useState(audioAlertService.isEnabled());

  const handleRequestNotification = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
  };

  const handleToggleSound = () => {
    const next = audioAlertService.toggle();
    setSoundEnabled(next);
  };

  const handleTestSound = () => {
    audioAlertService.playTacticalChime('critical');
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto text-slate-100">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
            Settings & Operational Preferences
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Configure notification dispatch channels, tactical audio synthesis, polling intervals, and geospatial defaults.
        </p>
      </div>

      {/* Main Settings Group */}
      <div className="p-5 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl space-y-6 text-xs">
        {/* 1. Notifications Section */}
        <div>
          <h3 className="font-bold text-white font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" />
            Browser Notification Dispatch
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#060b18] border border-blue-900/40">
            <div>
              <span className="font-semibold text-white block">Web Notification Alerts</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Delivers desktop alerts for critical events (M6.5+ earthquakes, cyclone landfall watches).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-400">Status: <strong className="text-blue-400 uppercase font-bold">{notificationPermission}</strong></span>
              {notificationPermission !== 'granted' && (
                <button
                  onClick={handleRequestNotification}
                  className="px-3 py-1.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-md"
                >
                  Enable Permissions
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Tactical Audio Alert Synthesis */}
        <div>
          <h3 className="font-bold text-white font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" />
            Tactical Acoustic Warning Synthesis
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#060b18] border border-blue-900/40">
            <div>
              <span className="font-semibold text-white block">Audio Chime Synthesis</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Synthesizes a dual-tone command center acoustic pulse on critical alert detection.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSound}
                className={`px-3 py-1.5 rounded-lg font-semibold border transition ${
                  soundEnabled
                    ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 font-bold'
                    : 'bg-[#0b1328] text-slate-400 border-blue-900/40 hover:text-white'
                }`}
              >
                {soundEnabled ? 'Enabled' : 'Muted'}
              </button>
              {soundEnabled && (
                <button
                  onClick={handleTestSound}
                  className="px-2.5 py-1.5 rounded-lg text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/40 font-mono text-[11px] font-semibold"
                >
                  Test Audio Chime
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Polling and Telemetry Refresh Rate */}
        <div>
          <h3 className="font-bold text-white font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-400" />
            Data Ingestion Refresh Interval
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#060b18] border border-blue-900/40">
            <div>
              <span className="font-semibold text-white block">Feed Synchronization Interval</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Governs automatic background polling of USGS and NASA EONET endpoints.
              </p>
            </div>

            <select
              value={refreshIntervalSeconds}
              onChange={(e) => onSetRefreshInterval(Number(e.target.value))}
              className="bg-[#0b1328] border border-blue-900/50 text-slate-200 rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value={30}>Every 30 seconds</option>
              <option value={60}>Every 1 minute</option>
              <option value={300}>Every 5 minutes</option>
              <option value={0}>Manual refresh only</option>
            </select>
          </div>
        </div>

        {/* 4. Preferred Geographical Sector */}
        <div>
          <h3 className="font-bold text-white font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            Default Geographic Monitoring Sector
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#060b18] border border-blue-900/40">
            <div>
              <span className="font-semibold text-white block">Preferred Region</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Automatically configures filter focus on startup.
              </p>
            </div>

            <select
              value={preferredRegion}
              onChange={(e) => onSelectPreferredRegion(e.target.value)}
              className="bg-[#0b1328] border border-blue-900/50 text-slate-200 rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="All">Global Overview</option>
              <option value="India">India / South Asia Sector</option>
              <option value="East Asia">East Asia / Japan</option>
              <option value="Southeast Asia">Southeast Asia / Indonesia</option>
              <option value="North America">North America</option>
            </select>
          </div>
        </div>

        {/* 5. Demonstration Mode Switch */}
        <div>
          <h3 className="font-bold text-white font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Hackathon Demonstration Dataset
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#060b18] border border-blue-900/40">
            <div>
              <span className="font-semibold text-white block">Demo Mode Active</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                When enabled, injects verified scenario datasets across multiple hazard classes for reliable presentation.
              </p>
            </div>

            <button
              onClick={onToggleDemoMode}
              className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                isDemoMode
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/50'
                  : 'bg-[#0b1328] text-slate-400 border-blue-900/40 hover:text-white'
              }`}
            >
              {isDemoMode ? 'DEMO MODE ACTIVE' : 'LIVE APIS ACTIVE'}
            </button>
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-blue-900/40 flex justify-end">
          <button
            onClick={onResetPreferences}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-[#060b18] hover:bg-[#101a35] border border-blue-900/40 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to System Factory Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};
