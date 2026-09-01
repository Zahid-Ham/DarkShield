import React from 'react';
import { IncidentRow } from './IncidentRow.jsx';
import { Shield } from 'lucide-react';

export function IncidentList({
  incidents = [],
  onInvestigate,
  onOpenManagerChat,
  onOpenMitigation
}) {
  return (
    <div>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Correlated Incident Case File ({incidents.length})
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Automated correlation of normalized security event logs into prioritized threat clusters
          </p>
        </div>
      </div>

      {/* Incident rows list */}
      {incidents.length === 0 ? (
        <div style={{
          padding: '36px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-muted)',
          fontSize: '12px'
        }}>
          No active security incident clusters recorded.
        </div>
      ) : (
        incidents.map(incident => (
          <IncidentRow
            key={incident.id}
            incident={incident}
            onInvestigate={onInvestigate}
            onOpenManagerChat={onOpenManagerChat}
            onOpenMitigation={onOpenMitigation}
          />
        ))
      )}
    </div>
  );
}
