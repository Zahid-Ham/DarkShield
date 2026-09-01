import React, { useState, useEffect } from 'react';
import {
  fetchGitHubStatus,
  fetchGitHubRuns,
  fetchRecentLogs,
  uploadLogFile,
  ingestLogUrl
} from '../services/api.js';
import { PipelineFlowIndicator } from '../components/common/PipelineFlowIndicator.jsx';
import { NormalizedEventStream } from '../components/telemetry/NormalizedEventStream.jsx';
import { WorkflowRunDrawer } from '../components/telemetry/WorkflowRunDrawer.jsx';
import { GitHubConnectWizard } from '../components/telemetry/GitHubConnectWizard.jsx';
import { GitHubSetupGuideModal } from '../components/telemetry/GitHubSetupGuideModal.jsx';
import {
  UploadCloud,
  FileCode,
  Link,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  GitBranch,
  Terminal,
  BookOpen,
  Settings
} from 'lucide-react';

export function LogInputPage() {
  // Log source selector: "github" (default primary) or "json"
  const [logSource, setLogSource] = useState('github');

  // Telemetry & Setup State
  const [ghStatus, setGhStatus] = useState(null);
  const [workflowData, setWorkflowData] = useState({ total_count: 0, runs: [] });
  const [recentEvents, setRecentEvents] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());
  const [loading, setLoading] = useState(true);

  // Setup Guide modal & reconfigure wizard state
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showReconfigure, setShowReconfigure] = useState(false);

  // Drawer & Upload state
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileDetails, setUploadedFileDetails] = useState(null);
  const [customUrl, setCustomUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);

  // Polling telemetry data every 12 seconds
  const loadTelemetryData = async () => {
    try {
      const [statusRes, runsRes, eventsRes] = await Promise.all([
        fetchGitHubStatus(),
        fetchGitHubRuns(15),
        fetchRecentLogs(50)
      ]);

      setGhStatus(statusRes);
      setWorkflowData(runsRes);
      setRecentEvents(eventsRes);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn("Polling telemetry failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetryData();
    const interval = setInterval(loadTelemetryData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadStatus({ type: 'info', msg: `Parsing ${file.name}...` });
    try {
      const res = await uploadLogFile(file);
      setUploadedFileDetails({
        filename: file.name,
        sizeBytes: file.size,
        eventCount: res.ingested_count || 1,
        timestamp: new Date().toLocaleTimeString()
      });
      setUploadStatus({ type: 'success', msg: `Successfully ingested ${res.ingested_count || 1} records from ${file.name}.` });
      loadTelemetryData();
    } catch (err) {
      setUploadStatus({ type: 'error', msg: err.message || "Failed to process log file." });
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setUploadStatus({ type: 'info', msg: `Connecting to ${customUrl}...` });
    try {
      const res = await ingestLogUrl(customUrl);
      setUploadStatus({ type: 'success', msg: res.message });
      loadTelemetryData();
    } catch (err) {
      setUploadStatus({ type: 'error', msg: err.message || "Failed to ingest from stream URL." });
    }
  };

  const isConnected = ghStatus?.configured && ghStatus?.status !== 'disconnected';

  return (
    <div>
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Live Security Telemetry Workspace
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
            Configure CI/CD telemetry pipelines, inspect workflow runs, and view normalized security log events
          </p>
        </div>

        {/* LOG SOURCE TOGGLE SELECTOR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xs)',
          padding: '2px'
        }}>
          <button
            onClick={() => setLogSource('github')}
            style={{
              padding: '5px 12px',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: logSource === 'github' ? 'var(--bg-accent-subtle)' : 'transparent',
              color: logSource === 'github' ? 'var(--accent-orange)' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: '700',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <GitBranch size={13} />
            GitHub Actions (Primary)
          </button>

          <button
            onClick={() => setLogSource('json')}
            style={{
              padding: '5px 12px',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: logSource === 'json' ? 'var(--bg-accent-subtle)' : 'transparent',
              color: logSource === 'json' ? 'var(--accent-orange)' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: '700',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileCode size={13} />
            JSON File Import
          </button>
        </div>
      </div>

      {/* PIPELINE PROCESSING STAGE INDICATOR */}
      <PipelineFlowIndicator />

      {/* VIEW: JSON FILE IMPORT MODE */}
      {logSource === 'json' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* PRIMARY: JSON LOG FILE IMPORT */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                LOCAL FILE IMPORT
              </span>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCode size={16} color="var(--accent-orange)" />
                JSON Log File Upload
              </h3>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              style={{
                border: `2px dashed ${dragActive ? 'var(--accent-orange)' : 'var(--border-medium)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: dragActive ? 'var(--bg-accent-subtle)' : 'var(--bg-subtle)',
                transition: 'all 0.15s ease'
              }}
            >
              <UploadCloud size={24} color="var(--accent-orange)" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Drag and drop structured JSON log file
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Supports raw or standardized CI/CD security event arrays
              </p>

              <label className="btn-primary" style={{ display: 'inline-block', padding: '6px 14px', fontSize: '11px', cursor: 'pointer' }}>
                Select File
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {uploadedFileDetails && (
              <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>File Inspector Metadata:</div>
                <div>Filename: <strong>{uploadedFileDetails.filename}</strong></div>
                <div>Size: <strong>{(uploadedFileDetails.sizeBytes / 1024).toFixed(2)} KB</strong></div>
                <div>Events Parsed: <strong>{uploadedFileDetails.eventCount}</strong></div>
              </div>
            )}

            {uploadStatus && (
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: uploadStatus.type === 'error' ? 'var(--bg-critical-subtle)' : 'var(--bg-accent-subtle)',
                color: uploadStatus.type === 'error' ? 'var(--status-critical-text)' : 'var(--status-low-text)'
              }}>
                {uploadStatus.msg}
              </div>
            )}
          </div>

          {/* SECONDARY: STREAM PRESET */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                STREAM PRESET
              </span>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link size={16} color="var(--accent-orange)" />
                HTTP Webhook Stream
              </h3>
            </div>

            <form onSubmit={handleUrlSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Ingest structured security logs from an external HTTP stream or custom webhook.
              </p>

              <input
                type="text"
                placeholder="http://127.0.0.1:8000/api/logs/ingest"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px'
                }}
              />

              <button type="submit" className="btn-secondary" style={{ fontSize: '11px', padding: '6px' }}>
                Connect Stream
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: GITHUB ACTIONS MODE */}
      {logSource === 'github' && (
        <>
          {/* SETUP WIZARD (If not connected or user clicked reconfigure) */}
          {(!isConnected || showReconfigure) && (
            <GitHubConnectWizard
              onConfigComplete={() => {
                setShowReconfigure(false);
                loadTelemetryData();
              }}
              onOpenSetupGuide={() => setShowSetupGuide(true)}
            />
          )}

          {/* ACTIVE MONITORING WORKSPACE (When connected & monitoring) */}
          {isConnected && !showReconfigure && (
            <>
              {/* TOP SOURCE STATUS HEADER */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                marginBottom: '16px',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--status-low-text)'
                    }}></span>
                    <span style={{ fontSize: '11px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                      LIVE TELEMETRY SOURCE
                    </span>
                  </div>

                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    GitHub Actions Telemetry Pipeline
                  </h2>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    <span>
                      Repository: <strong>{ghStatus?.owner && ghStatus?.repo ? `${ghStatus.owner}/${ghStatus.repo}` : 'Not configured'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Workflow: <strong>{ghStatus?.selected_workflow || 'All Workflows'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Connection: <strong style={{ color: 'var(--status-low-text)' }}>CONNECTED</strong>
                    </span>
                    <span>•</span>
                    <span>Events Received: <strong>{recentEvents.length}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    <RefreshCw size={12} color="var(--accent-orange)" className="spin-slow" />
                    <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>LIVE</span>
                    <span style={{ color: 'var(--text-light)' }}>•</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Updated: {lastSyncTime}</span>
                  </div>

                  <button
                    onClick={() => setShowReconfigure(true)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Settings size={13} color="var(--accent-orange)" />
                    Reconfigure Repo
                  </button>
                </div>
              </div>

              {/* RECENT WORKFLOW RUNS TABLE */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '20px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GitBranch size={16} color="var(--accent-orange)" />
                      Recent Workflow Runs ({workflowData.runs?.length || 0})
                    </h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Real workflow executions from {workflowData.owner}/{workflowData.repo}
                    </p>
                  </div>
                </div>

                {workflowData.runs?.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
                    No workflow runs found for {workflowData.owner}/{workflowData.repo}. Run a workflow in GitHub to generate telemetry.
                  </div>
                ) : (
                  <div style={{ border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <table className="soc-table">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Workflow Name</th>
                          <th>Run ID</th>
                          <th>Branch</th>
                          <th>Actor</th>
                          <th>Created</th>
                          <th>Conclusion</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workflowData.runs.map((run) => {
                          const isSuccess = run.conclusion === 'success';
                          const isFailure = run.conclusion === 'failure';
                          return (
                            <tr
                              key={run.id}
                              onClick={() => setSelectedRunId(run.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td>
                                <span style={{
                                  display: 'inline-block',
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: isSuccess ? 'var(--status-low-text)' : isFailure ? 'var(--status-critical-text)' : 'var(--status-medium-text)'
                                }}></span>
                              </td>
                              <td style={{ fontWeight: '700', fontSize: '12px' }}>{run.name}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: '700' }}>{run.id}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{run.head_branch || 'main'}</td>
                              <td style={{ fontSize: '11px' }}>{run.actor || 'system'}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                                {run.created_at ? new Date(run.created_at).toLocaleTimeString() : 'Recent'}
                              </td>
                              <td>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  fontFamily: 'var(--font-mono)',
                                  padding: '2px 6px',
                                  borderRadius: 'var(--radius-xs)',
                                  backgroundColor: isSuccess ? 'var(--bg-subtle)' : 'var(--bg-critical-subtle)',
                                  color: isSuccess ? 'var(--status-low-text)' : 'var(--status-critical-text)'
                                }}>
                                  {run.conclusion ? run.conclusion.toUpperCase() : run.status?.toUpperCase()}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setSelectedRunId(run.id)}
                                  style={{
                                    padding: '3px 8px',
                                    border: '1px solid var(--border-medium)',
                                    borderRadius: 'var(--radius-xs)',
                                    backgroundColor: 'var(--bg-surface)',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: 'var(--accent-orange)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Inspect Run
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* NORMALIZED SECURITY LOG EVENTS STREAM */}
      <NormalizedEventStream
        events={recentEvents}
        onSelectRun={(runId) => setSelectedRunId(runId)}
      />

      {/* WORKFLOW RUN DRAWER MODAL */}
      {selectedRunId && (
        <WorkflowRunDrawer
          runId={selectedRunId}
          onClose={() => setSelectedRunId(null)}
        />
      )}

      {/* SETUP GUIDE MODAL */}
      {showSetupGuide && (
        <GitHubSetupGuideModal
          onClose={() => setShowSetupGuide(false)}
        />
      )}
    </div>
  );
}

export const LogInput = LogInputPage;
