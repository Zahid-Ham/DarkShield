import React from 'react';
import { ShieldAlert, FileText, Activity, Layers } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { RiskBadge } from '../common/RiskBadge.jsx';

export function RiskOverview({ incidents = [], onGenerateReport }) {
  const activeCount = incidents.filter(i => i.status !== 'Mitigated').length;
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const highCount = incidents.filter(i => i.severity === 'HIGH').length;

  const maxRiskScore = incidents.reduce((max, inc) => Math.max(max, inc.riskScore || 0), 0);
  const overallSeverity = criticalCount > 0 ? 'CRITICAL' : highCount > 0 ? 'HIGH' : 'MEDIUM';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '14px',
      marginBottom: '20px'
    }}>
      {/* Overall Security Posture */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderTop: '3px solid var(--accent-orange)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Overall Risk Index
          </span>
          <ShieldAlert size={15} color="var(--accent-orange)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
          <span style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {maxRiskScore}<span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/100</span>
          </span>
          <RiskBadge severity={overallSeverity} label={overallSeverity} />
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
          Max Threat Score Recorded
        </span>
      </div>

      {/* Active Correlated Threats */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderTop: '2px solid #0284C7',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Correlated Threats
          </span>
          <Activity size={15} color="var(--text-muted)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
          <span style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {activeCount}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            ({criticalCount} Critical, {highCount} High)
          </span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px' }}>
          Active Threat Clusters
        </span>
      </div>

      {/* Analyzed Events */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderTop: '2px solid #22C55E',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Analyzed Event Logs
          </span>
          <Layers size={15} color="var(--text-muted)" />
        </div>
        <div style={{ marginTop: '6px' }}>
          <span style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            14,200
          </span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
          Normalized JSON Records
        </span>
      </div>

      {/* Executive Report Action */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderTop: '2px solid #8B5CF6',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Reporting Output
          </span>
          <FileText size={15} color="var(--text-muted)" />
        </div>
        <div style={{ marginTop: '6px' }}>
          <Button 
            variant="primary" 
            size="sm"
            icon={FileText} 
            onClick={onGenerateReport}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Generate Incident Report
          </Button>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px' }}>
          Compile PDF Evidence Brief
        </span>
      </div>
    </div>
  );
}
