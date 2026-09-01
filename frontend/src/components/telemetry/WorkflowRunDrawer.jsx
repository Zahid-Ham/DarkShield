import React, { useState, useEffect } from 'react';
import { X, GitBranch, CheckCircle2, AlertCircle, Clock, Copy, Check, Terminal, FileCode } from 'lucide-react';
import { fetchGitHubRunDetails } from '../../services/api.js';

export function WorkflowRunDrawer({ runId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);

  useEffect(() => {
    if (runId) {
      setLoading(true);
      fetchGitHubRunDetails(runId, true).then(res => {
        setData(res);
        setLoading(false);
      });
    }
  }, [runId]);

  const handleCopyJson = (evt) => {
    navigator.clipboard.writeText(JSON.stringify(evt, null, 2));
    setCopiedId(evt.event_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!runId) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 250,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '840px',
        maxHeight: '90vh',
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
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-medium)',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} color="var(--accent-orange)" />
              <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Workflow Run Telemetry Inspector
              </h3>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Run ID: {runId}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          padding: '18px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              Fetching workflow run telemetry from FastAPI engine...
            </div>
          ) : !data ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--status-critical-text)', fontSize: '12px' }}>
              Unable to retrieve workflow run details for ID {runId}. Check backend connection.
            </div>
          ) : (
            <>
              {/* Run Metadata Summary Table */}
              <div style={{ border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ padding: '6px 12px', backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-medium)', fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Run Metadata
                </div>
                <table className="soc-table">
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: '600', width: '130px' }}>Workflow Name:</td>
                      <td style={{ fontWeight: '700' }}>{data.name || 'Not available'}</td>
                      <td style={{ fontWeight: '600', width: '110px' }}>Repository:</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{data.owner}/{data.repository}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: '600' }}>Actor / Initiator:</td>
                      <td>{data.actor || 'Not available'}</td>
                      <td style={{ fontWeight: '600' }}>Conclusion:</td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          fontFamily: 'var(--font-mono)',
                          color: data.conclusion === 'success' ? 'var(--status-low-text)' : 'var(--status-critical-text)'
                        }}>
                          [{data.conclusion?.toUpperCase() || 'IN PROGRESS'}]
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Converted Normalized Events */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Normalized Security Log Events ({data.normalized_events?.length || 0})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.normalized_events?.map((evt) => {
                    const isExpanded = expandedEventId === evt.event_id;
                    return (
                      <div key={evt.event_id} style={{
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          padding: '8px 12px',
                          display: 'flex',
                          justify: 'space-between',
                          alignItems: 'center',
                          backgroundColor: 'var(--bg-subtle)',
                          cursor: 'pointer'
                        }}
                        onClick={() => setExpandedEventId(isExpanded ? null : evt.event_id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--text-muted)' }}>
                              {evt.event_id}
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)' }}>
                              {evt.event_type}
                            </span>
                            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              [{evt.severity}]
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCopyJson(evt); }}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}
                            >
                              {copiedId === evt.event_id ? <Check size={12} color="var(--status-low-text)" /> : <Copy size={12} />}
                              {copiedId === evt.event_id ? 'Copied' : 'Copy JSON'}
                            </button>
                            <span style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: '600' }}>
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </span>
                          </div>
                        </div>

                        <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {evt.message}
                        </div>

                        {isExpanded && (
                          <pre style={{
                            padding: '10px 12px',
                            backgroundColor: '#0F172A',
                            color: '#F8FAFC',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            overflowX: 'auto',
                            borderTop: '1px solid var(--border-medium)'
                          }}>
                            {JSON.stringify(evt, null, 2)}
                          </pre>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
