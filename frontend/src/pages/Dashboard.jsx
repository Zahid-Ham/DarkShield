import React, { useState, useEffect } from 'react';
import { RiskOverview } from '../components/dashboard/RiskOverview.jsx';
import { IncidentList } from '../components/dashboard/IncidentList.jsx';
import { ManagerChat } from '../components/investigation/ManagerChat.jsx';
import { MitigationModal } from '../components/investigation/MitigationModal.jsx';
import { PipelineFlowIndicator } from '../components/common/PipelineFlowIndicator.jsx';
import { useIncidents } from '../hooks/useIncidents.js';
import { fetchGitHubStatus, fetchGitHubRuns, fetchRecentLogs } from '../services/api.js';
import { Terminal, RefreshCw, GitBranch, ShieldAlert } from 'lucide-react';

export function Dashboard({ onSelectIncident, onGenerateReport }) {
  const { incidents, loading, error } = useIncidents();
  const [selectedForChat, setSelectedForChat] = useState(null);
  const [selectedForMitigation, setSelectedForMitigation] = useState(null);

  // Live Telemetry Summary State
  const [ghStatus, setGhStatus] = useState(null);
  const [latestWorkflow, setLatestWorkflow] = useState(null);
  const [recentCount, setRecentCount] = useState(0);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const loadTelemetrySummary = async () => {
      try {
        const [statusRes, runsRes, logsRes] = await Promise.all([
          fetchGitHubStatus(),
          fetchGitHubRuns(1),
          fetchRecentLogs(10)
        ]);
        setGhStatus(statusRes);
        setLatestWorkflow(runsRes.runs?.[0] || null);
        setRecentCount(logsRes.length || 0);
        setLastSync(new Date().toLocaleTimeString());
      } catch (err) {
        console.warn("Failed loading live telemetry summary for dashboard:", err);
      }
    };

    loadTelemetrySummary();
    const interval = setInterval(loadTelemetrySummary, 12000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
        Loading correlated incident state...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--status-critical-text)', fontSize: '12px' }}>
        Error loading incident state: {error.message}
      </div>
    );
  }

  const isConnected = ghStatus?.configured && ghStatus?.status === 'connected';

  return (
    <div>
      {/* 1. DASHBOARD TITLE HEADER */}
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            SOC Operations Dashboard
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
            Real-time threat status, posture metrics, and incident investigation list
          </p>
        </div>
      </div>

      {/* 2. LIVE TELEMETRY TOP STRIP */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} color="var(--accent-orange)" />
            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              LIVE TELEMETRY (Real-Time Ingestion)
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              fontFamily: 'var(--font-mono)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: isConnected ? 'var(--bg-subtle)' : 'var(--bg-critical-subtle)',
              color: isConnected ? 'var(--status-low-text)' : 'var(--status-critical-text)'
            }}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Last sync: {lastSync}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-medium)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>SOURCE</span>
            <strong style={{ color: 'var(--text-primary)' }}>GitHub Actions</strong>
          </div>

          <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-medium)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>REPOSITORY</span>
            <strong style={{ color: 'var(--text-primary)' }}>{ghStatus?.owner && ghStatus?.repo ? `${ghStatus.owner}/${ghStatus.repo}` : 'Not available'}</strong>
          </div>

          <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-medium)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>LATEST WORKFLOW</span>
            <strong style={{ color: 'var(--text-primary)' }}>{latestWorkflow?.name || 'None'}</strong>
          </div>

          <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-medium)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>EVENTS RECEIVED</span>
            <strong style={{ color: 'var(--accent-orange)' }}>{recentCount} Events</strong>
          </div>
        </div>
      </div>

      {/* 3. PIPELINE PROCESSING FLOW STAGES */}
      <PipelineFlowIndicator />

      {/* 4. POSTURE METRICS */}
      <RiskOverview incidents={incidents} onGenerateReport={onGenerateReport} />

      {/* 5. INCIDENTS CASE MANAGEMENT DATASET */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={16} color="var(--status-critical-text)" />
          <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            INCIDENTS & CASE FILES (Current Investigation Dataset)
          </h2>
        </div>

        <IncidentList
          incidents={incidents}
          onInvestigate={(incident) => onSelectIncident(incident)}
          onOpenManagerChat={(incident) => setSelectedForChat(incident)}
          onOpenMitigation={(incident) => setSelectedForMitigation(incident)}
        />
      </div>

      {/* Contextual Modals */}
      {selectedForChat && (
        <ManagerChat
          incident={selectedForChat}
          onClose={() => setSelectedForChat(null)}
        />
      )}

      {selectedForMitigation && (
        <MitigationModal
          incident={selectedForMitigation}
          onClose={() => setSelectedForMitigation(null)}
        />
      )}
    </div>
  );
}
