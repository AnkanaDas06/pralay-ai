import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Bell, 
  Volume2, 
  VolumeX, 
  Radio, 
  Sparkles, 
  RefreshCw
} from 'lucide-react';
import { DataSourceStatus } from '../../types/disaster';
import { audioAlertService } from '../../services/audioService';

interface HeaderProps {
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  onSimulateAlert: () => void;
  activeIncidentsCount: number;
  criticalCount: number;
  sourceStatuses: DataSourceStatus[];
  onOpenNotifications: () => void;
  unreadAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isDemoMode,
  onToggleDemoMode,
  onManualRefresh,
  isRefreshing,
  onSimulateAlert,
  sourceStatuses,
  onOpenNotifications,
  unreadAlertsCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [timeZoneName, setTimeZoneName] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(audioAlertService.isEnabled());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimeZoneName(tz);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSound = () => {
    const nextState = audioAlertService.toggle();
    setSoundEnabled(nextState);
  };

  const operationalFeeds = sourceStatuses.filter(s => s.status === 'operational').length;

  return (
    <header className="sticky top-0 z-40 bg-[#050b1a]/85 backdrop-blur-md border-b border-cyan-900/30 text-slate-100 px-4 py-2.5 shadow-md">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/40 shadow-glow-blue">
            <span className="absolute w-2 h-2 rounded-full bg-cyan-400 top-1 right-1 animate-pulse"></span>
            <ShieldAlert className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg sm:text-xl text-white font-sans">
                PRALAY<span className="text-blue-400 ml-1 font-mono font-medium text-sm sm:text-base">AI</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-700/60 text-blue-300 font-bold uppercase tracking-wider hidden sm:inline-block">
                OPS v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block tracking-wide font-sans">
              Global Disaster Intelligence & Emergency Response Platform
            </p>
          </div>
        </div>

        {/* Live System Clock & Telemetry Connection */}
        <div className="hidden lg:flex items-center gap-4 bg-[#0b1328] px-3.5 py-1.5 rounded-xl border border-blue-900/40 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-white text-sm tracking-wider">{currentTime}</span>
            <span className="text-[10px] text-slate-400">({timeZoneName.split('/')[1] || timeZoneName})</span>
          </div>

          <div className="w-[1px] h-4 bg-blue-900/50" />

          {/* Feed Telemetry Indicator - Black & Green / Blue */}
          <div className="flex items-center gap-1.5" title="USGS, NASA EONET, IMD & Open-Meteo Sensor Status">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="text-[11px] text-emerald-300 font-bold">
              {isDemoMode ? 'DEMO SIMULATION' : `${operationalFeeds}/${sourceStatuses.length || 4} FEEDS LIVE`}
            </span>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Mode Toggle Button */}
          <button
            onClick={onToggleDemoMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition shadow-xs ${
              isDemoMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-[#0b1328] text-slate-300 border-blue-900/40 hover:text-white hover:bg-[#101a35]'
            }`}
            title="Toggle between real live API monitoring and hackathon demo dataset"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isDemoMode ? 'DEMO MODE' : 'LIVE FEEDS'}</span>
          </button>

          {/* Test Emergency Alert Trigger (Hackathon Evaluator Showcase) */}
          <button
            onClick={onSimulateAlert}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 transition shadow-xs"
            title="Simulate an incoming critical disaster alert to demonstrate notifications & sound"
          >
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="hidden md:inline">Simulate Alert</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className={`p-1.5 rounded-lg bg-[#0b1328] hover:bg-[#101a35] text-slate-300 hover:text-cyan-400 border border-blue-900/40 transition ${
              isRefreshing ? 'animate-spin text-cyan-400' : ''
            }`}
            title="Force refresh live feeds from USGS, NASA EONET & Open-Meteo"
            aria-label="Refresh telemetry feeds"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Audio Chime Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-1.5 rounded-lg border transition ${
              soundEnabled
                ? 'bg-blue-950/60 text-blue-300 border-blue-700 hover:bg-blue-900/80'
                : 'bg-[#0b1328] text-slate-400 border-blue-900/40 hover:text-slate-200'
            }`}
            title={soundEnabled ? 'Acoustic Alert Chimes Active' : 'Sound Muted (Click to enable)'}
            aria-label="Toggle tactical audio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Alert Bell / Notification Center Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-lg bg-[#0b1328] hover:bg-[#101a35] text-slate-200 hover:text-white border border-blue-900/40 transition"
            aria-label="Open notifications center"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
