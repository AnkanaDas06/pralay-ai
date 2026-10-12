import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Incident, 
  FilterState, 
  DataSourceStatus, 
  RiskAssessment,
  SeverityLevel,
  HazardType
} from './types/disaster';
import { fetchLiveIncidents } from './services/apiService';
import { DEMO_INCIDENTS } from './data/demoIncidents';
import { EMERGENCY_RESOURCES } from './data/emergencyResources';
import { calculateRiskAssessment } from './services/riskEngine';
import { audioAlertService } from './services/audioService';
import { dispatchSystemAlertNotification } from './services/notificationService';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  BellRing, 
  Flag, 
  LifeBuoy,
  History 
} from 'lucide-react';

// Components
import { Header } from './components/common/Header';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { IncidentDetailModal } from './components/map/IncidentDetailModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { HistoricalIntelligenceView } from './components/views/HistoricalIntelligenceView';
import { MapView } from './components/views/MapView';
import { AlertCenterView } from './components/views/AlertCenterView';
import { RiskAnalyticsView } from './components/views/RiskAnalyticsView';
import { IndiaCommandView } from './components/views/IndiaCommandView';
import { EmergencyDirectoryView } from './components/views/EmergencyDirectoryView';
import { AboutSourcesView } from './components/views/AboutSourcesView';
import { SettingsView } from './components/views/SettingsView';

export function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [focusedCoordinates, setFocusedCoordinates] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // Data & Telemetry States
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sourceStatuses, setSourceStatuses] = useState<DataSourceStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toISOString());
  const [refreshInterval, setRefreshInterval] = useState<number>(60);

  // Alerts, Read Tracking & Toasts
  const [readIncidentIds, setReadIncidentIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('pralay_read_incidents');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    hazardTypes: [],
    severities: [],
    region: 'All',
    searchQuery: '',
    timeRangeHours: 24,
    onlyCritical: false,
  });

  // Toast dispatch helper
  const addToast = useCallback((title: string, description: string, type: ToastMessage['type'] = 'info') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      description,
      type,
      timestamp: Date.now(),
    };
    setToasts((prev) => [...prev.slice(-4), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch telemetry feeds
  const loadData = useCallback(async (demo: boolean = isDemoMode) => {
    setIsRefreshing(true);
    try {
      if (demo) {
        setIncidents(DEMO_INCIDENTS);
        setSourceStatuses([
          {
            name: 'USGS Earthquake Realtime Feed',
            endpoint: 'earthquake.usgs.gov/summary/2.5_day',
            status: 'operational',
            lastChecked: new Date().toISOString(),
            latencyMs: 120,
            incidentCount: DEMO_INCIDENTS.filter(i => i.hazardType === 'earthquake').length,
          },
          {
            name: 'NASA EONET v3 Natural Hazards',
            endpoint: 'eonet.gsfc.nasa.gov/api/v3/events',
            status: 'operational',
            lastChecked: new Date().toISOString(),
            latencyMs: 185,
            incidentCount: DEMO_INCIDENTS.filter(i => i.hazardType !== 'earthquake').length,
          },
          {
            name: 'IMD / NDMA Early Warning Gateway',
            endpoint: 'mausam.imd.gov.in',
            status: 'operational',
            lastChecked: new Date().toISOString(),
            latencyMs: 140,
            incidentCount: 4,
          },
          {
            name: 'Open-Meteo Meteorological Model',
            endpoint: 'api.open-meteo.com/v1/forecast',
            status: 'operational',
            lastChecked: new Date().toISOString(),
            latencyMs: 95,
            incidentCount: 6,
          }
        ]);
        setLastRefreshed(new Date().toISOString());
      } else {
        const result = await fetchLiveIncidents();
        setIncidents(result.incidents);
        setSourceStatuses(result.statuses);
        setLastRefreshed(result.lastUpdated);
      }
    } catch {
      // Graceful fallback to demo dataset if network error
      setIncidents(DEMO_INCIDENTS);
      addToast('Network Telemetry Alert', 'Live feed fetch degraded; falling back to local disaster telemetry cache.', 'warning');
    } finally {
      setIsRefreshing(false);
    }
  }, [isDemoMode, addToast]);

  // Initial load
  useEffect(() => {
    loadData(false);
  }, []);

  // Auto refresh interval
  useEffect(() => {
    if (refreshInterval <= 0) return;
    const timer = setInterval(() => {
      loadData(isDemoMode);
    }, refreshInterval * 1000);
    return () => clearInterval(timer);
  }, [refreshInterval, isDemoMode, loadData]);

  // Toggle demo mode
  const handleToggleDemoMode = () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    loadData(next);
    addToast(
      next ? 'Demo Mode Activated' : 'Live Monitoring Active',
      next ? 'Loaded comprehensive curated disaster scenarios for presentation.' : 'Switched to live USGS and NASA sensor feeds.',
      next ? 'warning' : 'success'
    );
  };

  // Simulate incoming critical alert (Hackathon Feature)
  const handleSimulateIncomingAlert = () => {
    const simId = `sim-crit-${Date.now()}`;
    const simIncident: Incident = {
      id: simId,
      title: 'URGENT: M 7.3 Undersea Seismic Rupture - Nicobar Arc',
      hazardType: 'earthquake',
      severity: 'critical',
      status: 'official_warning',
      location: 'Great Nicobar Island, Andaman & Nicobar Union Territory',
      country: 'India',
      region: 'South Asia',
      coordinates: { lat: 7.15, lng: 93.75, depthKm: 24 },
      timestamp: new Date().toISOString(),
      magnitudeOrIntensity: 'M 7.3 • Depth 24km',
      impactRadiusKm: 240,
      source: 'INCOIS Tsunami Warning Center & USGS Priority Telemetry',
      sourceUrl: 'https://incois.gov.in',
      verificationStatus: 'simulated_demo',
      description: 'Major subduction thrust event registered by deep ocean pressure sensors. Regional coastal inundation watch initiated for Andaman Sea coastal belts.',
      safetyGuidance: [
        'Move inland and seek higher ground immediately if near coast.',
        'Stay clear of ports, harbor docks, and estuarine channels.',
        'Keep VHF disaster radios tuned to disaster broadcast frequency 156.8 MHz.',
        'Follow instructions issued by Andaman & Nicobar Disaster Management Directorate.'
      ],
      lastUpdated: new Date().toISOString(),
      isDemo: true,
    };

    // Prepend to incidents list
    setIncidents(prev => [simIncident, ...prev]);
    setSelectedIncident(simIncident);
    setFocusedCoordinates({ lat: 7.15, lng: 93.75, zoom: 7 });

    // Audio chime
    audioAlertService.playTacticalChime('critical');

    // Browser notification
    dispatchSystemAlertNotification(simIncident.title, `${simIncident.location} — ${simIncident.magnitudeOrIntensity}`, 'critical');

    // In-app Toast
    addToast('CRITICAL DISASTER ALERT', `${simIncident.title} — Centering tactical radar on epicenter.`, 'critical');
  };

  // Mark alert as read
  const handleMarkAsRead = (id: string) => {
    setReadIncidentIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('pralay_read_incidents', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const handleMarkAllAsRead = () => {
    const allIds = new Set(incidents.map(i => i.id));
    setReadIncidentIds(allIds);
    localStorage.setItem('pralay_read_incidents', JSON.stringify(Array.from(allIds)));
    addToast('Alerts Cleared', 'All active disaster alerts marked as read.', 'info');
  };

  // Center map handler
  const handleFocusMap = (lat: number, lng: number, zoom?: number) => {
    setFocusedCoordinates({ lat, lng, zoom: zoom || 7 });
    if (activeTab !== 'dashboard' && activeTab !== 'map') {
      setActiveTab('map');
    }
  };

  // Filter incidents based on active filter state
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // 1. Hazard type filter
      if (filters.hazardTypes.length > 0 && !filters.hazardTypes.includes(incident.hazardType)) {
        return false;
      }

      // 2. Severity filter
      if (filters.severities.length > 0 && !filters.severities.includes(incident.severity)) {
        return false;
      }

      // 3. Region filter
      if (filters.region !== 'All') {
        const r = filters.region.toLowerCase();
        const match = incident.country.toLowerCase().includes(r) ||
          incident.region.toLowerCase().includes(r) ||
          incident.location.toLowerCase().includes(r);
        if (!match) return false;
      }

      // 4. Time range filter
      if (filters.timeRangeHours > 0) {
        const eventTime = new Date(incident.timestamp).getTime();
        const windowLimit = Date.now() - (filters.timeRangeHours * 60 * 60 * 1000);
        if (eventTime < windowLimit) return false;
      }

      // 5. Search query filter
      if (filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase();
        const textMatch = incident.title.toLowerCase().includes(q) ||
          incident.location.toLowerCase().includes(q) ||
          incident.country.toLowerCase().includes(q) ||
          incident.source.toLowerCase().includes(q) ||
          incident.hazardType.toLowerCase().includes(q);
        if (!textMatch) return false;
      }

      return true;
    });
  }, [incidents, filters]);

  // Compute Risk Assessment for the current subset of incidents
  const riskAssessment: RiskAssessment = useMemo(() => {
    return calculateRiskAssessment(filteredIncidents, filters.region);
  }, [filteredIncidents, filters.region]);

  const criticalCount = useMemo(() => incidents.filter(i => i.severity === 'critical').length, [incidents]);
  const unreadAlertsCount = useMemo(() => incidents.filter(i => !readIncidentIds.has(i.id)).length, [incidents, readIncidentIds]);

  return (
    <div className="flex flex-col min-h-screen cyclone-command-bg text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      {/* Atmospheric satellite vignette overlay */}
      <div className="cyclone-vignette-overlay" />

      {/* Top Telemetry Header */}
      <div className="relative z-20">
        <Header
          isDemoMode={isDemoMode}
          onToggleDemoMode={handleToggleDemoMode}
          onManualRefresh={() => {
            loadData(isDemoMode);
            addToast('Telemetry Synchronized', 'Polled live endpoints for latest updates.', 'info');
          }}
          isRefreshing={isRefreshing}
          onSimulateAlert={handleSimulateIncomingAlert}
          activeIncidentsCount={incidents.length}
          criticalCount={criticalCount}
          sourceStatuses={sourceStatuses}
          onOpenNotifications={() => setActiveTab('alerts')}
          unreadAlertsCount={unreadAlertsCount}
        />
      </div>

      {/* Main Command-Center Body */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          unreadCount={unreadAlertsCount}
          criticalCount={criticalCount}
        />

        {/* Dynamic Center Stage Content View */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 pb-20 md:pb-5">
          <div className="max-w-[1920px] mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                incidents={incidents}
                filteredIncidents={filteredIncidents}
                emergencyResources={EMERGENCY_RESOURCES}
                selectedIncident={selectedIncident}
                onSelectIncident={setSelectedIncident}
                filters={filters}
                onFilterChange={setFilters}
                riskAssessment={riskAssessment}
                onFocusMap={handleFocusMap}
                focusedCoordinates={focusedCoordinates}
                isDemoMode={isDemoMode}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'historical' && (
              <HistoricalIntelligenceView
                onFocusMap={handleFocusMap}
                onSelectIncident={setSelectedIncident}
                onShowToast={addToast}
              />
            )}

            {activeTab === 'map' && (
              <MapView
                incidents={incidents}
                filteredIncidents={filteredIncidents}
                emergencyResources={EMERGENCY_RESOURCES}
                selectedIncident={selectedIncident}
                onSelectIncident={setSelectedIncident}
                filters={filters}
                onFilterChange={setFilters}
                focusedCoordinates={focusedCoordinates}
                onFocusMap={handleFocusMap}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertCenterView
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
                onFocusMap={(lat, lng) => handleFocusMap(lat, lng, 7)}
                onSimulateAlert={handleSimulateIncomingAlert}
                readIncidentIds={readIncidentIds}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            )}

            {activeTab === 'risk' && (
              <RiskAnalyticsView
                incidents={filteredIncidents}
                riskAssessment={riskAssessment}
                selectedRegion={filters.region}
              />
            )}

            {activeTab === 'india' && (
              <IndiaCommandView
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
                onFocusMap={handleFocusMap}
              />
            )}

            {activeTab === 'resources' && (
              <EmergencyDirectoryView
                onFocusMap={handleFocusMap}
              />
            )}

            {activeTab === 'sources' && (
              <AboutSourcesView
                sourceStatuses={sourceStatuses}
                onManualRefresh={() => loadData(isDemoMode)}
                isRefreshing={isRefreshing}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                isDemoMode={isDemoMode}
                onToggleDemoMode={handleToggleDemoMode}
                preferredRegion={filters.region}
                onSelectPreferredRegion={(reg) => setFilters(f => ({ ...f, region: reg }))}
                refreshIntervalSeconds={refreshInterval}
                onSetRefreshInterval={setRefreshInterval}
                onResetPreferences={() => {
                  setFilters({
                    hazardTypes: [],
                    severities: [],
                    region: 'All',
                    searchQuery: '',
                    timeRangeHours: 24,
                    onlyCritical: false,
                  });
                  setRefreshInterval(60);
                  addToast('Settings Restored', 'System preferences returned to defaults.', 'info');
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Selected Incident Tactical Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onFocusMap={(lat, lng) => handleFocusMap(lat, lng, 8)}
        />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Mobile Tactical Bottom Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('historical')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'historical' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-5 h-5" />
          <span>Archive</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'map' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapIcon className="w-5 h-5" />
          <span>World Map</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors relative ${
            activeTab === 'alerts' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <BellRing className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
              </span>
            )}
          </div>
          <span>Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('india')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'india' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flag className="w-5 h-5 text-amber-400" />
          <span>India Ops</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'resources' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LifeBuoy className="w-5 h-5 text-emerald-400" />
          <span>Helpline</span>
        </button>
      </nav>

      {/* Operational Footer */}
      <Footer />
    </div>
  );
}

export default App;
