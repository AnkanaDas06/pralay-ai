import React, { useEffect, useState } from 'react';
import { DataSourceStatus, SyncLogEntry } from '../../types/disaster';
import { fetchSyncLogs, triggerLiveDatabaseSync } from '../../services/dbClient';
import { 
  Database, 
  Scale, 
  CheckCircle2,
  Server,
  Cpu,
  RefreshCw,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';

interface AboutSourcesViewProps {
  sourceStatuses: DataSourceStatus[];
  onManualRefresh: () => void;
  isRefreshing: boolean;
}

export const AboutSourcesView: React.FC<AboutSourcesViewProps> = ({
  sourceStatuses,
  onManualRefresh,
  isRefreshing,
}) => {
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const loadLogs = async () => {
    const logs = await fetchSyncLogs(10);
    setSyncLogs(logs);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Ingesting live feeds from USGS, NASA EONET, NOAA IBTrACS and IMD...');
    try {
      const res = await triggerLiveDatabaseSync();
      if (res.success) {
        setSyncMessage(`Database synchronized successfully! ${res.totalIngested} records ingested/updated.`);
        await loadLogs();
        onManualRefresh();
      } else {
        setSyncMessage('Synchronization partially completed. Check audit logs below.');
      }
    } catch {
      setSyncMessage('Failed to trigger background synchronization.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4 text-slate-100">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Data Sources, Sync Automation & Provenance Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            PRALAY AI integrates live physical sensor streams with historical archive repositories into an indexed, persistent SQLite database. All synchronization attempts are logged with audited timestamps, record counts, and latency measurements.
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md transition self-start md:self-auto shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync All Sources Now'}</span>
        </button>
      </div>

      {syncMessage && (
        <div className="p-3 bg-cyan-950/60 border border-cyan-800/80 rounded-xl text-xs text-cyan-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Live Data Sources Health Monitor Table */}
      <div className="p-5 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold font-mono uppercase text-white tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            Authoritative Upstream Provider Telemetry Status
          </h3>
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="px-2.5 py-1 text-xs font-mono text-cyan-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/60 border border-cyan-500/50 rounded-lg transition font-semibold"
          >
            {isRefreshing ? 'Testing Ping...' : 'Probe Endpoints'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-blue-900/40 text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">DATA PROVIDER</th>
                <th className="py-2.5 px-3">ENDPOINT / PROTOCOL</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">LATENCY</th>
                <th className="py-2.5 px-3">SYNCHRONIZED EVENTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/60 font-mono text-xs">
              {sourceStatuses.map((source, idx) => (
                <tr key={idx} className="hover:bg-[#101a35] transition">
                  <td className="py-3 px-3 font-semibold text-white font-sans flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      source.status === 'operational' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}></span>
                    {source.name}
                  </td>
                  <td className="py-3 px-3 text-cyan-400">{source.endpoint}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      source.status === 'operational'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                    }`}>
                      {source.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{source.latencyMs} ms</td>
                  <td className="py-3 px-3 text-white font-bold">{source.incidentCount} in database</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Synchronization Log Table */}
      <div className="p-5 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold font-mono uppercase text-white tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Audit Synchronization Log (SQLite Database Operations)
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            Persistent Ingestion Trail
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-blue-900/40 text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">TIMESTAMP (UTC)</th>
                <th className="py-2.5 px-3">SOURCE NAME</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">INGESTED</th>
                <th className="py-2.5 px-3">DURATION</th>
                <th className="py-2.5 px-3">DIAGNOSTIC / NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/60 font-mono text-xs">
              {syncLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No sync logs recorded yet. Trigger a sync using the button above.
                  </td>
                </tr>
              ) : (
                syncLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#101a35] transition">
                    <td className="py-2.5 px-3 text-slate-300">
                      {log.syncTimestamp ? log.syncTimestamp.replace('T', ' ').slice(0, 19) : 'Recent'}
                    </td>
                    <td className="py-2.5 px-3 text-white font-sans font-semibold">
                      {log.sourceName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        log.status === 'success' 
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' 
                          : 'bg-red-950/60 text-red-300 border border-red-500/40'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">
                      +{log.recordsIngested} records
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {log.durationMs} ms
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">
                      {log.errorMessage ? (
                        <span className="text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {log.errorMessage}
                        </span>
                      ) : (
                        <span className="text-slate-500">Deduplicated & Indexed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scientific Integrity & Prediction Disclaimers */}
        <div className="p-5 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Scale className="w-5 h-5 shrink-0" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
              Scientific Transparency & Epistemic Boundaries
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The platform strictly enforces the following scientific principles:
          </p>
          <ul className="space-y-2 text-xs text-slate-200">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>No Spurious Predictions:</strong> Science cannot deterministically predict the precise timing, exact epicenter, and magnitude of an earthquake. PRALAY AI reports observed seismic events and historical probabilistic hazard zones, never speculative forecasts.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Verification Status Separation:</strong> Every data object is transparently classified as an <em>observed event</em>, an <em>official warning</em>, or a <em>model risk estimate</em>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>No Fabricated Casualties:</strong> In the absence of validated municipal casualty reports, casualty figures are labeled as Unknown or Not Officially Reported.</span>
            </li>
          </ul>
        </div>

        {/* Project Mission & Architecture */}
        <div className="p-5 rounded-xl bg-[#0b1328] border border-blue-900/40 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-5 h-5 shrink-0" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
              Persistent Database & Ingestion Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Built to provide long-term disaster resilience and historical intelligence:
          </p>
          <ul className="space-y-2 text-xs text-slate-200">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Persistent SQLite Storage:</strong> All events are written to local disk (<code>pralay_disasters.db</code>) with B-tree indexes across timestamps, hazard types, and severities.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Multi-Year Historical Depth:</strong> Ingests decades of major cyclones with NOAA IBTrACS tracks, USGS megathrust earthquakes, and historical deluge floods.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Automatic Deduplication:</strong> Provider IDs prevent duplicate insertion during scheduled or manual sync cycles while preserving historical records.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
