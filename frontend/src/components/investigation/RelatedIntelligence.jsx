import React from 'react';
import { Database } from 'lucide-react';
import { MOCK_EXPOSURE_INTELLIGENCE } from '../../mock/intelligence.js';

export function RelatedIntelligence() {
  const cases = MOCK_EXPOSURE_INTELLIGENCE.historicalSimilarAttacks || [];

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-md)',
      padding: '18px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        <Database size={15} color="var(--accent-orange)" />
        Historical Threat Vector Matches
      </h3>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>
        Correlated attack patterns matched against historical threat KB
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {cases.map((c, idx) => (
          <div key={idx} style={{
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            backgroundColor: 'var(--bg-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--text-muted)' }}>
                {c.caseId}
              </span>
              <span style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--accent-orange-subtle)',
                color: 'var(--accent-orange)',
                border: '1px solid var(--accent-orange-border)'
              }}>
                Vector Match: {c.similarityScore}
              </span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {c.attackPattern}
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              <strong>Vector:</strong> {c.vector}<br />
              <strong>Historical Outcome:</strong> {c.outcome}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
