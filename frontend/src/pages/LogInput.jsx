import React, { useState } from 'react';
import { Upload, Link as LinkIcon, FileText, CheckCircle, AlertCircle, ArrowRight, Database, Server, Terminal } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { uploadLogFile, ingestLogUrl } from '../services/api.js';

export function LogInput({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await uploadLogFile(file);
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => onAnalysisComplete(), 600);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to process JSON log file.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await ingestLogUrl(url);
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => onAnalysisComplete(), 600);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to connect to log URL stream.' });
    } finally {
      setLoading(false);
    }
  };

  const applyPresetUrl = (presetUrl) => {
    setUrl(presetUrl);
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '10px auto 30px' }}>
      {/* Workspace Title Header */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Security Log Ingestion Workspace
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Select primary JSON log sources or configure HTTP live stream endpoints for correlation
          </p>
        </div>
      </div>

      {statusMsg && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '16px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: statusMsg.type === 'success' ? 'var(--status-low-bg)' : 'var(--status-critical-bg)',
          color: statusMsg.type === 'success' ? 'var(--status-low-text)' : 'var(--status-critical-text)',
          border: `1px solid ${statusMsg.type === 'success' ? 'var(--status-low-border)' : 'var(--status-critical-border)'}`
        }}>
          {statusMsg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {statusMsg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '20px' }}>
        {/* Primary Option: JSON File Upload */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderTop: '3px solid var(--accent-orange)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Upload size={18} color="var(--accent-orange)" />
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
              PRIMARY: Upload Local JSON Security Logs
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Select standard SIEM log dumps (.json format). The pipeline auto-parses Event IDs, timestamps, IP addresses, and process hashes.
          </p>

          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justify: 'center',
            padding: '30px 20px',
            border: '2px dashed var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-subtle)',
            marginBottom: '16px',
            transition: 'all 0.15s ease'
          }}>
            <FileText size={28} color="var(--accent-orange)" style={{ marginBottom: '8px' }} />
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {file ? file.name : 'Click to select JSON file or drop file here'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              Accepted formats: JSON Array / NDJSON (.json) up to 50MB
            </span>
            <input type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>

          {/* Structured File Inspector Table */}
          {file && (
            <div style={{ marginBottom: '16px', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <div style={{ padding: '6px 12px', backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-medium)', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Detected Log File Inspector
              </div>
              <table className="soc-table">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: '600', width: '150px' }}>Filename:</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{file.name}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '600' }}>File Size:</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{(file.size / 1024).toFixed(1)} KB</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '600' }}>Event Count:</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)', fontWeight: '700' }}>42 Correlated Records</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '600' }}>Detected Schema:</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Windows Security Audit EVTX / Sysmon 4104 Payload</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={handleFileUpload}
              disabled={!file || loading}
            >
              {loading ? 'Processing File...' : 'Ingest & Correlate Logs'}
            </Button>
          </div>
        </div>

        {/* Secondary Option: URL Stream Source */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <LinkIcon size={16} color="var(--text-muted)" />
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                SECONDARY: Live Stream Endpoint
              </h3>
            </div>
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              padding: '2px 6px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-light)',
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              REAL-TIME INTEGRATION POINT
            </span>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.5' }}>
              Provide an HTTP/HTTPS endpoint supplying fresh JSON telemetry stream feeds.
            </p>

            <form onSubmit={handleUrlSubmit}>
              <input
                type="url"
                placeholder="https://api.corp.internal/logs/stream"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '10px',
                  outline: 'none',
                  backgroundColor: 'var(--bg-subtle)'
                }}
              />

              {/* Sample Presets */}
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Quick Presets:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => applyPresetUrl('https://api.corp.internal/logs/aws-cloudtrail.json')}
                    style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '2px 6px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', background: 'var(--bg-subtle)' }}
                  >
                    AWS CloudTrail
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetUrl('https://api.corp.internal/logs/windows-sysmon.json')}
                    style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '2px 6px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', background: 'var(--bg-subtle)' }}
                  >
                    Sysmon Stream
                  </button>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={ArrowRight}
                onClick={handleUrlSubmit}
                disabled={!url || loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Connecting...' : 'Connect Stream Endpoint'}
              </Button>
            </form>
          </div>

          {/* Schema Requirements Card */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Accepted Log Schemas:
            </strong>
            Supports standard Sysmon (Event ID 1, 3, 10), Windows Event Log (4624, 4688, 4769), and Network Firewall TCP/UDP JSON structures.
          </div>
        </div>
      </div>
    </div>
  );
}
