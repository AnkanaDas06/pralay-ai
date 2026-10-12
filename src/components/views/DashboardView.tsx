import React from 'react';
import { Incident, FilterState, EmergencyResource, RiskAssessment } from '../../types/disaster';
import { StatCard } from '../dashboard/StatCard';
import { DisasterMap } from '../map/DisasterMap';
import { IncidentFeed } from '../dashboard/IncidentFeed';
import { QuickFilter } from '../dashboard/QuickFilter';
import { 
  ShieldAlert, 
  Activity, 
  ArrowUpRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface DashboardViewProps {
  incidents: Incident[];
  filteredIncidents: Incident[];
  emergencyResources: EmergencyResource[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  riskAssessment: RiskAssessment;
  onFocusMap: (lat: number, lng: number, zoom?: number) => void;
  focusedCoordinates?: { lat: number; lng: number; zoom?: number } | null;
  isDemoMode: boolean;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  incidents,
  filteredIncidents,
  emergencyResources,
  selectedIncident,
  onSelectIncident,
  filters,
  onFilterChange,
  riskAssessment,
  onFocusMap,
  focusedCoordinates,
  isDemoMode,
  onNavigateToTab,
}) => {
  const criticalCount = incidents.filter(i => i.severity === 'critical').length;
  const officialWarnings = incidents.filter(i => i.status === 'official_warning').length;
  const seismicCount = incidents.filter(i => i.hazardType === 'earthquake').length;

  return (
    <div className="space-y-4">
      {/* Top Banner Notice for Demo Mode if active */}
      {isDemoMode && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-bold uppercase tracking-wider font-mono">DEMONSTRATION SIMULATION ACTIVE</span>
            <span className="text-amber-300/80 hidden sm:inline">&mdash; Showing verified scenario data for hackathon evaluation. Real API feeds can be toggled in header.</span>
          </div>
          <span className="text-[11px] font-mono bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded border border-amber-500/50 font-bold">
            DEMO MODE
          </span>
        </div>
      )}

      {/* Primary Telemetry Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Active Incidents"
          value={incidents.length}
          subValue={`${seismicCount} seismic, ${incidents.length - seismicCount} meteorological`}
          icon={Activity}
          badge="LIVE TELEMETRY"
          badgeVariant="cyan"
          onClick={() => onFilterChange({ ...filters, hazardTypes: [] })}
        />

        <StatCard
          title="Critical Alerts"
          value={criticalCount}
          subValue={criticalCount > 0 ? 'Immediate public safety advisory' : 'No critical emergencies detected'}
          icon={ShieldAlert}
          badge={criticalCount > 0 ? 'RED ALERT' : 'NOMINAL'}
          badgeVariant={criticalCount > 0 ? 'critical' : 'low'}
          onClick={() => onFilterChange({ ...filters, severities: ['critical'] })}
        />

        <StatCard
          title="Overall Risk Level"
          value={riskAssessment.riskLevel.toUpperCase() + ' RISK'}
          subValue={`Score: ${riskAssessment.overallScore}/100 • Trend: ${riskAssessment.trend}`}
          icon={TrendingUp}
          badge={`P-MHRS ${riskAssessment.overallScore}`}
          badgeVariant={riskAssessment.riskLevel === 'critical' ? 'critical' : riskAssessment.riskLevel === 'high' ? 'high' : 'moderate'}
          onClick={() => onNavigateToTab('risk')}
        />

        <StatCard
          title="Official Warnings"
          value={officialWarnings}
          subValue="IMD, USGS & National Warning Centers"
          icon={FileCheck}
          badge="VERIFIED"
          badgeVariant="cyan"
          onClick={() => onNavigateToTab('alerts')}
        />
      </div>

      {/* Centerpiece: Interactive World Map & Live Feed Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Large Interactive World Map (8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Global Disaster Map
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('map')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 hover:underline font-mono"
            >
              <span>Expand Global Disaster Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <DisasterMap
            incidents={filteredIncidents}
            emergencyResources={emergencyResources}
            selectedIncident={selectedIncident}
            onSelectIncident={onSelectIncident}
            focusedCoordinates={focusedCoordinates}
            heightClass="h-[480px] sm:h-[540px]"
          />
        </div>

        {/* Live Incident Activity Feed (4 cols on desktop) */}
        <div className="lg:col-span-4 h-[540px]">
          <IncidentFeed
            incidents={filteredIncidents}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => {
              onSelectIncident(inc);
            }}
            onFocusMap={(lat, lng) => onFocusMap(lat, lng, 7)}
          />
        </div>
      </div>

      {/* Multi-Hazard Filter Bar */}
      <QuickFilter
        filters={filters}
        onFilterChange={onFilterChange}
        totalCount={incidents.length}
        filteredCount={filteredIncidents.length}
      />

      {/* Quick Situation Assessment & Safety Banner */}
      <div className="p-4 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl text-slate-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase text-blue-400 tracking-wider">
                COMPOSITE RISK ADVISORY
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Formula: {riskAssessment.formulaExplanation}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {riskAssessment.recommendedActions[0] || 'Continuous multi-hazard telemetry monitoring active across regional seismological and meteorological grids.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
            <button
              onClick={() => onNavigateToTab('india')}
              className="flex-1 md:flex-none px-3.5 py-2 text-xs font-bold text-orange-300 bg-orange-950/60 hover:bg-orange-900/60 border border-orange-500/40 rounded-lg transition text-center"
            >
              India Sector Mode &rarr;
            </button>
            <button
              onClick={() => onNavigateToTab('resources')}
              className="flex-1 md:flex-none px-3.5 py-2 text-xs font-bold text-blue-300 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/40 rounded-lg transition text-center"
            >
              Emergency Resources &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
