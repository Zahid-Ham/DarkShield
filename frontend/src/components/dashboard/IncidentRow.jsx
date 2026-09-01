import React from 'react';
import { MessageSquare, ShieldAlert, ArrowRight, Clock, User, HardDrive } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge.jsx';
import { Button } from '../common/Button.jsx';
import { formatTimestamp } from '../../utils/severity.js';

export function IncidentRow({
  incident,
  onInvestigate,
  onOpenManagerChat,
  onOpenMitigation
}) {
  const isCritical = incident.severity === 'CRITICAL';
  const isHigh = incident.severity === 'HIGH';

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-medium)',
      borderLeft: isCritical ? '4px solid var(--status-critical-text)' : isHigh ? '4px solid var(--accent-orange)' : '4px solid var(--border-strong)',
      padding: '14px 16px',
      marginBottom: '10px',
      borderRadius: 'var(--radius-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: 'var(--shadow-subtle)',
      transition: 'all 0.15s ease'
    }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RiskBadge severity={incident.severity} score={incident.riskScore} />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: '700' }}>
            {incident.id}
          </span>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {incident.title}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span><strong>Category:</strong> {incident.attackType}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> {formatTimestamp(incident.timestamp)}
          </span>
        </div>
      </div>

      {/* Target Host & User Metadata Row */}
      <div style={{ display: 'flex', gap: '20px', fontSize: '11px', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <HardDrive size={13} color="var(--text-muted)" />
          <strong>Target Host:</strong> <code style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{incident.affectedEntity}</code>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <User size={13} color="var(--text-muted)" />
          <strong>Account:</strong> <code style={{ fontFamily: 'var(--font-mono)' }}>{incident.user}</code>
        </span>
        <span>
          <strong>AI Confidence:</strong> <strong style={{ color: 'var(--accent-orange)' }}>{incident.confidence}</strong>
        </span>
      </div>

      {/* Evidence Summary Strip */}
      <div style={{
        fontSize: '12px',
        color: 'var(--text-primary)',
        backgroundColor: 'var(--bg-subtle)',
        padding: '8px 12px',
        borderRadius: 'var(--radius-xs)',
        border: '1px solid var(--border-light)',
        lineHeight: '1.45'
      }}>
        <strong style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '6px' }}>Evidence Summary:</strong>
        {incident.evidenceSummary}
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', paddingTop: '2px' }}>
        <Button
          variant="outline"
          size="sm"
          icon={MessageSquare}
          onClick={() => onOpenManagerChat(incident)}
        >
          Explain to Manager
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={ShieldAlert}
          onClick={() => onOpenMitigation(incident)}
        >
          Mitigation Playbook
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={ArrowRight}
          onClick={() => onInvestigate(incident)}
        >
          Investigate Incident
        </Button>
      </div>
    </div>
  );
}
