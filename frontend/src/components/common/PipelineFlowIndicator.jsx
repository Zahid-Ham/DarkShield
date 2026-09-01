import React from 'react';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export function PipelineFlowIndicator() {
  const stages = [
    { id: 'source', label: 'SOURCE', desc: 'GitHub Actions / JSON', active: true },
    { id: 'ingestion', label: 'INGESTION', desc: 'FastAPI /api/logs', active: true },
    { id: 'normalization', label: 'NORMALIZATION', desc: 'Provider-Agnostic', active: true },
    { id: 'detection', label: 'DETECTION', desc: 'ML Threat Engine', active: false },
    { id: 'correlation', label: 'CORRELATION', desc: 'Attack Graph', active: false },
    { id: 'investigation', label: 'INVESTIGATION', desc: 'Multi-Agent AI', active: false },
  ];

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      marginBottom: '16px',
      boxShadow: 'var(--shadow-subtle)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          SentinelAI Pipeline Processing Stages
        </span>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)', fontWeight: '600' }}>
          PHASE 1 INGESTION ACTIVE
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '4px'
      }}>
        {stages.map((stage, idx) => (
          <React.Fragment key={stage.id}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: stage.active ? 'var(--bg-subtle)' : 'transparent',
              border: `1px solid ${stage.active ? 'var(--border-medium)' : 'var(--border-light)'}`,
              opacity: stage.active ? 1 : 0.6
            }}>
              {stage.active ? (
                <CheckCircle2 size={12} color="var(--status-low-text)" />
              ) : (
                <Clock size={12} color="var(--text-muted)" />
              )}
              <div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: stage.active ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  display: 'block',
                  lineHeight: '1.2'
                }}>
                  {stage.label}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', lineHeight: '1.1', display: 'block' }}>
                  {stage.desc}
                </span>
              </div>
            </div>

            {idx < stages.length - 1 && (
              <ArrowRight size={11} color="var(--text-light)" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
