import React from 'react';
import { Shield, ArrowRight, Activity, Terminal, Lock, FileSearch, Cpu, CheckCircle, Database } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { MOCK_INCIDENTS } from '../mock/incidents.js';

export function Landing({ onStart }) {
  const activeCount = MOCK_INCIDENTS.filter(i => i.status !== 'Mitigated').length;
  const criticalCount = MOCK_INCIDENTS.filter(i => i.severity === 'CRITICAL').length;

  return (
    <div style={{ maxWidth: '1140px', margin: '10px auto 30px' }}>
      {/* High-Impact Hero Banner */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderTop: '3px solid var(--accent-orange)',
        borderRadius: 'var(--radius-md)',
        padding: '32px 36px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 9px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--accent-orange-subtle)',
              color: 'var(--accent-orange)',
              fontSize: '11px',
              fontWeight: '700',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              marginBottom: '14px',
              border: '1px solid var(--accent-orange-border)'
            }}>
              <Shield size={12} /> Autonomous Threat Investigation Engine
            </div>

            <h1 style={{
              fontSize: '26px',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: '1.25',
              marginBottom: '12px'
            }}>
              Agentic AI Cybersecurity Assistant for Automated Threat Investigation
            </h1>

            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              Ingest security logs, auto-correlate multi-stage attack chains across hosts, generate evidence-grounded manager briefs, and execute targeted mitigation playbooks for modern Security Operations Centers (SOC).
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="primary" size="lg" icon={ArrowRight} onClick={onStart}>
                Launch Ingestion & Analysis Workstream
              </Button>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            minWidth: '220px',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              System Environment
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>ENGINE:</strong> FastAPI Python 3.14</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>CLIENT:</strong> React 18 + Vite</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>SCHEMA:</strong> JSON / EVTX / Sysmon</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>AGENTS:</strong> 4 Active Workers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational KPI Metric Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderTop: '2px solid #22C55E',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            System Status
          </span>
          <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--status-low-text)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={16} /> Operational
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>SOC Pipeline Active</span>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderTop: '2px solid var(--accent-orange)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Correlated Threats
          </span>
          <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '4px' }}>
            {activeCount} Active <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--status-critical-text)' }}>({criticalCount} Critical)</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Threat Clusters</span>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderTop: '2px solid #0284C7',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Monitored Entities
          </span>
          <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '4px' }}>
            14 Hosts / 42 Users
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Domain Telemetry</span>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderTop: '2px solid #8B5CF6',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            Parsed Log Volume
          </span>
          <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)', marginTop: '4px' }}>
            14,200 Events
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Normalized JSON Records</span>
        </div>
      </div>

      {/* Workstation Modules Table */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Workstation Core Pipeline Modules
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Operational architecture setup for automated incident handling
            </p>
          </div>
        </div>

        <table className="soc-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Pipeline Component</th>
              <th style={{ width: '38%' }}>Operational Capability</th>
              <th style={{ width: '28%' }}>Output Telemetry</th>
              <th style={{ width: '12%', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: '700' }}>Log Ingestion Engine</td>
              <td>Ingests raw JSON logs or HTTP stream endpoints for event normalization</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>NDJSON / EVTX Parsed Objects</td>
              <td style={{ textAlign: 'right' }}><span style={{ color: 'var(--status-low-text)', fontWeight: '700', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>[READY]</span></td>
            </tr>
            <tr>
              <td style={{ fontWeight: '700' }}>Attack Chain Correlator</td>
              <td>Links isolated security logs into chronological multi-stage attack graphs</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>Threat Clusters & Risk Scores</td>
              <td style={{ textAlign: 'right' }}><span style={{ color: 'var(--status-low-text)', fontWeight: '700', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>[READY]</span></td>
            </tr>
            <tr>
              <td style={{ fontWeight: '700' }}>Contextual Manager Assistant</td>
              <td>Translates complex incident telemetry into executive briefs locked to case context</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>Executive Summaries & Q&A</td>
              <td style={{ textAlign: 'right' }}><span style={{ color: 'var(--status-low-text)', fontWeight: '700', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>[READY]</span></td>
            </tr>
            <tr>
              <td style={{ fontWeight: '700' }}>Mitigation Playbook Engine</td>
              <td>Generates containment, recovery, and GPO prevention playbooks by asset criticality</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>Action Steps & Asset Targets</td>
              <td style={{ textAlign: 'right' }}><span style={{ color: 'var(--status-low-text)', fontWeight: '700', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>[READY]</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
