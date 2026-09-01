import React from 'react';
import { FileCheck } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge.jsx';

export function EvidencePanel({ incident }) {
  if (!incident) return null;

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-md)',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          <FileCheck size={16} color="var(--accent-orange)" />
          Technical Evidence & Forensic Findings
        </h3>
        <RiskBadge severity={incident.severity} score={incident.riskScore} />
      </div>

      {/* Telemetry Metadata Table */}
      <div style={{ border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        <table className="soc-table">
          <tbody>
            <tr>
              <td style={{ fontWeight: '600', width: '140px' }}>Target Host:</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{incident.affectedEntity}</td>
              <td style={{ fontWeight: '600', width: '120px' }}>Target User:</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{incident.user}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Attack Category:</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{incident.attackType}</td>
              <td style={{ fontWeight: '600' }}>Confidence:</td>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)', fontWeight: '700' }}>{incident.confidence}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Identified Risk Factors */}
      <div>
        <h4 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Correlated Forensic Risk Indicators:
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {incident.riskFactors?.map((factor, idx) => (
            <div key={idx} style={{
              fontSize: '12px',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-subtle)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-xs)',
              borderLeft: '3px solid var(--accent-orange)',
              fontFamily: 'var(--font-mono)',
              borderTop: '1px solid var(--border-light)',
              borderRight: '1px solid var(--border-light)',
              borderBottom: '1px solid var(--border-light)'
            }}>
              • {factor}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Response Box */}
      <div style={{
        backgroundColor: 'var(--status-high-bg)',
        border: '1px solid var(--status-high-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 14px',
        fontSize: '12px'
      }}>
        <strong style={{ color: 'var(--status-high-text)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Actionable Forensic Recommendation:
        </strong>
        <p style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>
          {incident.recommendedResponse}
        </p>
      </div>
    </div>
  );
}
