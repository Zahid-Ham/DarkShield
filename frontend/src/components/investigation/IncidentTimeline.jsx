import React from 'react';
import { RiskBadge } from '../common/RiskBadge.jsx';
import { formatTimestamp } from '../../utils/severity.js';

export function IncidentTimeline({ events = [] }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-md)',
      padding: '18px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '4px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        Correlated Event Execution Chain ({events.length} Log Items)
      </h3>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Chronological event timeline reconstructed from raw SIEM/EDR log payloads
      </p>

      {events.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No log events correlated for this incident timeline.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {events.map((evt, idx) => (
            <div key={evt.id || idx} style={{
              borderLeft: '3px solid var(--border-strong)',
              paddingLeft: '14px',
              position: 'relative'
            }}>
              {/* Bullet Node */}
              <div style={{
                position: 'absolute',
                left: '-6px',
                top: '4px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: evt.severity === 'CRITICAL' ? 'var(--status-critical-text)' : 'var(--accent-orange)'
              }} />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <RiskBadge severity={evt.severity} />
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {formatTimestamp(evt.timestamp)}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {evt.source} <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '400', color: 'var(--text-muted)' }}>(Event ID: {evt.eventID})</span>
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: '4px 0 6px', lineHeight: '1.45' }}>
                  {evt.description}
                </p>

                {evt.rawPayload && (
                  <pre style={{
                    fontSize: '11px',
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    overflowX: 'auto',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    lineHeight: '1.4'
                  }}>
                    {evt.rawPayload}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
