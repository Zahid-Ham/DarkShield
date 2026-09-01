import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight, Terminal, Filter } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge.jsx';
import { formatTimestamp } from '../../utils/severity.js';

export function NormalizedEventStream({ events = [], onSelectRun }) {
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleCopyJson = (e, eventObj) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(eventObj, null, 2));
    setCopiedId(eventObj.event_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-md)',
      padding: '16px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={15} color="var(--accent-orange)" />
            Normalized Ingested Telemetry Stream ({events.length})
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Real-time normalized event stream ingested via FastAPI endpoint
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div style={{
          padding: '30px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border-medium)',
          color: 'var(--text-muted)',
          fontSize: '12px'
        }}>
          No normalized security events recorded in the current session.
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <table className="soc-table">
            <thead>
              <tr>
                <th style={{ width: '30px' }}></th>
                <th>Event ID</th>
                <th>Timestamp</th>
                <th>Source / Repo</th>
                <th>Event Type</th>
                <th>Severity</th>
                <th>User / Host</th>
                <th>Message</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => {
                const isExpanded = expandedId === evt.event_id;
                return (
                  <React.Fragment key={evt.event_id}>
                    <tr
                      onClick={() => toggleExpand(evt.event_id)}
                      style={{ cursor: 'pointer', backgroundColor: isExpanded ? 'var(--bg-subtle)' : 'transparent' }}
                    >
                      <td>
                        {isExpanded ? <ChevronDown size={14} color="var(--accent-orange)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '11px', color: 'var(--text-primary)' }}>
                        {evt.event_id}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatTimestamp(evt.timestamp)}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        <div>{evt.source}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{evt.repository}</div>
                      </td>
                      <td style={{ fontWeight: '600', fontSize: '11px' }}>
                        {evt.event_type}
                      </td>
                      <td>
                        <RiskBadge severity={evt.severity} />
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {evt.user}
                      </td>
                      <td style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {evt.message}
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          {evt.run_id && evt.run_id !== 'unspecified' && onSelectRun && (
                            <button
                              onClick={() => onSelectRun(evt.run_id)}
                              style={{
                                padding: '2px 6px',
                                border: '1px solid var(--border-medium)',
                                borderRadius: 'var(--radius-xs)',
                                backgroundColor: 'var(--bg-surface)',
                                fontSize: '10px',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--accent-orange)',
                                cursor: 'pointer'
                              }}
                            >
                              Run #{evt.run_id}
                            </button>
                          )}
                          <button
                            onClick={(e) => handleCopyJson(e, evt)}
                            style={{
                              padding: '2px 6px',
                              border: '1px solid var(--border-medium)',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'var(--bg-surface)',
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {copiedId === evt.event_id ? <Check size={11} color="var(--status-low-text)" /> : <Copy size={11} />}
                            {copiedId === evt.event_id ? 'Copied' : 'JSON'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Raw Normalized JSON View */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} style={{ padding: '0', backgroundColor: '#0F172A' }}>
                          <div style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent-orange)', textTransform: 'uppercase' }}>
                                Complete Normalized Event Object ({evt.event_id})
                              </span>
                            </div>
                            <pre style={{
                              backgroundColor: '#1E293B',
                              color: '#F8FAFC',
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-xs)',
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              overflowX: 'auto',
                              border: '1px solid #334155',
                              lineHeight: '1.4'
                            }}>
                              {JSON.stringify(evt, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
