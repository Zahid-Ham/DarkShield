import React from 'react';
import { getSeverityStyle } from '../../utils/severity.js';

export function RiskBadge({ severity, label, score }) {
  const style = getSeverityStyle(severity);
  
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: 'var(--radius-xs)',
        fontSize: '11px',
        fontWeight: '700',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.04em',
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        lineHeight: '1'
      }}
    >
      <span>{label || severity}</span>
      {score !== undefined && (
        <span style={{ opacity: 0.85, fontSize: '10px', marginLeft: '2px' }}>[{score}]</span>
      )}
    </span>
  );
}
