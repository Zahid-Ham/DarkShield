import React from 'react';
import { X, BookOpen, Key, GitBranch, Terminal, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function GitHubSetupGuideModal({ onClose }) {
  const steps = [
    {
      num: '01',
      title: 'Create GitHub Personal Access Token',
      desc: 'Go to GitHub Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens or Tokens (classic).'
    },
    {
      num: '02',
      title: 'Configure Required Permissions',
      desc: 'Grant Read access for Actions (Actions: Read) and Metadata (Metadata: Read). No write permissions are needed.'
    },
    {
      num: '03',
      title: 'Connect Token to SentinelAI',
      desc: 'Enter your Personal Access Token in the SentinelAI setup wizard to authenticate the backend REST connection.'
    },
    {
      num: '04',
      title: 'Select Target Repository',
      desc: 'Choose the target repository from your accessible repositories list fetched by the backend.'
    },
    {
      num: '05',
      title: 'Select Workflow',
      desc: 'Choose the GitHub Actions CI/CD workflow that SentinelAI will monitor for telemetry.'
    },
    {
      num: '06',
      title: 'Configure Live Telemetry Endpoint',
      desc: 'Add the SentinelAI ingestion URL as a SENTINEL_INGEST_URL repository secret in your GitHub repository settings.'
    },
    {
      num: '07',
      title: 'Run GitHub Actions Workflow',
      desc: 'Trigger your workflow on GitHub via git push or manual workflow dispatch.'
    },
    {
      num: '08',
      title: 'Verify Incoming Telemetry Stream',
      desc: 'SentinelAI will automatically receive, normalize, and display structured security events in the live telemetry workspace.'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '85vh',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-overlay)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-medium)',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="var(--accent-orange)" />
            <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              GitHub Actions Telemetry Setup Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Follow these step-by-step instructions to connect any GitHub repository and stream live CI/CD security telemetry to SentinelAI.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {steps.map((step) => (
              <div key={step.num} style={{
                display: 'flex',
                gap: '14px',
                padding: '10px 14px',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-subtle)'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '800',
                  color: 'var(--accent-orange)',
                  width: '24px'
                }}>
                  {step.num}
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
