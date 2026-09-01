import React, { useState, useEffect } from 'react';
import { Eye, DollarSign, Info } from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge.jsx';
import { fetchExposureIntelligence } from '../services/api.js';

export function ExposureIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExposureIntelligence().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
        Loading threat exposure intelligence workspace...
      </div>
    );
  }

  const { summary, darkWebLeaks, financialImpactBreakdown } = data;

  return (
    <div>
      {/* Workspace Header */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Exposure & Dark-Web Intelligence Workspace
            </h1>
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: '700',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-medium)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)'
            }}>
              SYNTHETIC MOCK FEED
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            External threat exposure monitoring, leak discovery records, and financial risk forecasting
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      <div style={{
        padding: '10px 14px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderLeft: '3px solid var(--accent-orange)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <Info size={15} color="var(--accent-orange)" />
        <span>
          <strong>Operational Notice:</strong> Exposure records below utilize synthetic threat data for evaluation. Live external breach database APIs can be connected in Phase 2.
        </span>
      </div>

      {/* KPI Metrics Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderTop: '2px solid #0284C7', padding: '14px 16px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-subtle)' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Exposed User Records</span>
          <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '4px' }}>
            {summary.totalExposedRecords.toLocaleString()}
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Identified across breach dumps</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderTop: '2px solid var(--accent-orange)', padding: '14px 16px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-subtle)' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Dark Web Mentions</span>
          <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)', marginTop: '4px' }}>
            {summary.darkWebMentions} Leak Files
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Monitored breach forums</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderTop: '2px solid var(--status-critical-text)', padding: '14px 16px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-subtle)' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Forecasted Financial Impact</span>
          <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--status-critical-text)', marginTop: '4px' }}>
            ${summary.estimatedFinancialRiskUSD.toLocaleString()}
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Estimated remediation cost</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderTop: '2px solid #8B5CF6', padding: '14px 16px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-subtle)' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Threat Actor Group</span>
          <div style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '6px' }}>
            {summary.criticalThreatActors.join(', ')}
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Intelligence Attribution</span>
        </div>
      </div>

      {/* Grid: Dark Web Leak Records Table & Financial Breakdown Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 480px', gap: '20px' }}>
        {/* Dark Web Intelligence Table */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '18px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            <Eye size={16} color="var(--accent-orange)" />
            Observed Leak Records & Forum Telemetry
          </h3>

          <table className="soc-table">
            <thead>
              <tr>
                <th>Record Title / Source</th>
                <th>Exposed Data Fields</th>
                <th>Records</th>
                <th style={{ textAlign: 'right' }}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {darkWebLeaks.map(leak => (
                <tr key={leak.id}>
                  <td>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block' }}>{leak.title}</strong>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {leak.forumName} • Date: {leak.dateDetected}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {leak.sampleExposedFields.join(', ')}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                    {leak.recordsCount}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <RiskBadge severity={leak.severity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Risk Assessment Table */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '18px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            <DollarSign size={16} color="var(--accent-orange)" />
            Financial & Remediation Cost Assessment
          </h3>

          <table className="soc-table">
            <thead>
              <tr>
                <th>Impact Category</th>
                <th>Cost Drivers</th>
                <th style={{ textAlign: 'right' }}>Estimated Cost</th>
              </tr>
            </thead>
            <tbody>
              {financialImpactBreakdown.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '700' }}>{item.category}</td>
                  <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.details}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '800', color: 'var(--text-primary)' }}>
                    ${item.estimatedCostUSD.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
