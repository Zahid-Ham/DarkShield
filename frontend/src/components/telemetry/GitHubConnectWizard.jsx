import React, { useState } from 'react';
import {
  connectGitHubToken,
  fetchGitHubRepos,
  fetchGitHubWorkflows,
  configureGitHubTarget
} from '../../services/api.js';
import {
  Key,
  CheckCircle2,
  AlertCircle,
  Search,
  GitBranch,
  Copy,
  Check,
  ArrowRight,
  Terminal,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

export function GitHubConnectWizard({ onConfigComplete, onOpenSetupGuide }) {
  // Setup steps: 1 = Connect Prompt, 2 = Token Input, 3 = Repo Select, 4 = Workflow Select, 5 = Endpoint Config & Verify
  const [step, setStep] = useState(1);
  const [tokenInput, setTokenInput] = useState('');
  const [authResult, setAuthResult] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [testingToken, setTestingToken] = useState(false);

  // Repos & Workflows state
  const [repos, setRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);

  const [workflows, setWorkflows] = useState([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  // Current ngrok/local endpoint for ingestion
  const ingestionEndpoint = `${window.location.origin}/api/logs/ingest`;

  // Step 2: Handle Token Validation
  const handleTestToken = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setTestingToken(true);
    setAuthError(null);

    try {
      const res = await connectGitHubToken(tokenInput.trim());
      setAuthResult(res);
      setStep(3); // Move to Repo Selection

      // Fetch user repos
      setLoadingRepos(true);
      const repoList = await fetchGitHubRepos();
      setRepos(repoList);
      setLoadingRepos(false);
    } catch (err) {
      setAuthError(err.message || "Failed to authenticate GitHub token.");
    } finally {
      setTestingToken(false);
    }
  };

  // Step 4: Handle Repo Selection
  const handleSelectRepo = async (repoObj) => {
    setSelectedRepo(repoObj);
    setLoadingWorkflows(true);
    setStep(4); // Move to Workflow Selection

    try {
      const wfList = await fetchGitHubWorkflows(repoObj.owner, repoObj.name);
      setWorkflows(wfList);
    } catch (err) {
      console.warn("Failed fetching workflows:", err);
      setWorkflows([]);
    } finally {
      setLoadingWorkflows(false);
    }
  };

  // Step 5: Handle Workflow Selection
  const handleSelectWorkflow = async (wfObj) => {
    setSelectedWorkflow(wfObj);
    setStep(5); // Move to Config & Verification
  };

  // Step 6: Complete Setup & Start Monitoring
  const handleFinalizeConfig = async () => {
    if (!selectedRepo) return;
    try {
      await configureGitHubTarget({
        owner: selectedRepo.owner,
        repo: selectedRepo.name,
        workflow_name: selectedWorkflow?.name || null,
        workflow_id: selectedWorkflow?.id || null
      });
      if (onConfigComplete) onConfigComplete();
    } catch (err) {
      console.warn("Configuration failed:", err);
    }
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(ingestionEndpoint);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const filteredRepos = repos.filter(r =>
    r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: 'var(--shadow-card)'
    }}>
      {/* Setup Step Tracker Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--border-medium)',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)'
      }}>
        <span style={{ fontWeight: '800', color: 'var(--accent-orange)' }}>SETUP WIZARD</span>
        <span style={{ color: 'var(--text-light)' }}>•</span>
        <span style={{ color: step >= 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === 1 ? '700' : '400' }}>1. Connect</span>
        <span style={{ color: 'var(--text-light)' }}>→</span>
        <span style={{ color: step >= 2 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === 2 ? '700' : '400' }}>2. Token</span>
        <span style={{ color: 'var(--text-light)' }}>→</span>
        <span style={{ color: step >= 3 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === 3 ? '700' : '400' }}>3. Repository</span>
        <span style={{ color: 'var(--text-light)' }}>→</span>
        <span style={{ color: step >= 4 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === 4 ? '700' : '400' }}>4. Workflow</span>
        <span style={{ color: 'var(--text-light)' }}>→</span>
        <span style={{ color: step >= 5 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === 5 ? '700' : '400' }}>5. Telemetry</span>
      </div>

      {/* STEP 1: INITIAL CONNECT PROMPT */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              STEP 1 — CONNECT GITHUB
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
              Connect GitHub Repository Telemetry
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Connect any GitHub repository to stream workflow executions and normalized CI/CD security events directly into SentinelAI.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <button
              onClick={() => setStep(2)}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '12px' }}
            >
              Connect GitHub Account
            </button>

            <button
              onClick={onOpenSetupGuide}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <BookOpen size={14} color="var(--accent-orange)" />
              View Setup Guide →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: TOKEN SETUP */}
      {step === 2 && (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              STEP 2 — TOKEN SETUP
            </span>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Enter GitHub Personal Access Token
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              SentinelAI requires a GitHub Personal Access Token with <strong>Actions: Read</strong> and <strong>Metadata: Read</strong> permissions.
            </p>
          </div>

          <form onSubmit={handleTestToken} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '540px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                GitHub Personal Access Token
              </label>
              <input
                type="password"
                placeholder="github_pat_11..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px'
                }}
              />
            </div>

            {authError && (
              <div style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--bg-critical-subtle)',
                color: 'var(--status-critical-text)',
                fontSize: '11px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertCircle size={14} />
                {authError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                disabled={testingToken || !tokenInput.trim()}
                className="btn-primary"
                style={{ padding: '7px 16px', fontSize: '11px' }}
              >
                {testingToken ? 'Validating Token...' : 'Test Connection'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary"
                style={{ padding: '7px 12px', fontSize: '11px' }}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: REPOSITORY SELECTION */}
      {step === 3 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                STEP 3 — REPOSITORY SELECTION
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                Select GitHub Repository
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Authenticated as <strong>{authResult?.authenticated_user}</strong>. Select target repository to monitor.
              </p>
            </div>

            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search repos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '11px'
                }}
              />
            </div>
          </div>

          {loadingRepos ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              Fetching accessible repositories from GitHub...
            </div>
          ) : filteredRepos.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
              No matching repositories found.
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', maxHeight: '240px', overflowY: 'auto' }}>
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>Repository</th>
                    <th>Owner</th>
                    <th>Default Branch</th>
                    <th>Visibility</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRepos.map((repo) => (
                    <tr key={repo.full_name}>
                      <td style={{ fontWeight: '700', fontSize: '12px' }}>
                        {repo.name}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {repo.owner}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {repo.default_branch}
                      </td>
                      <td>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {repo.private ? 'Private' : 'Public'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleSelectRepo(repo)}
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--accent-orange)' }}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: WORKFLOW SELECTION */}
      {step === 4 && selectedRepo && (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              STEP 4 — WORKFLOW SELECTION
            </span>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Select Workflow for {selectedRepo.owner}/{selectedRepo.name}
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Choose the CI/CD workflow SentinelAI will inspect for telemetry events.
            </p>
          </div>

          {loadingWorkflows ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              Discovering workflows...
            </div>
          ) : workflows.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-medium)' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>No active workflows detected in this repository.</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                You can proceed with general repository workflow monitoring.
              </p>
              <button
                onClick={() => handleSelectWorkflow({ id: 'all', name: 'All Workflow Runs' })}
                className="btn-primary"
                style={{ marginTop: '10px', padding: '6px 14px', fontSize: '11px' }}
              >
                Monitor All Workflows
              </button>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>Workflow Name</th>
                    <th>Path</th>
                    <th>State</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((wf) => (
                    <tr key={wf.id}>
                      <td style={{ fontWeight: '700', fontSize: '12px' }}>{wf.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{wf.path}</td>
                      <td style={{ fontSize: '10px', fontWeight: '700', color: 'var(--status-low-text)' }}>{wf.state?.toUpperCase()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleSelectWorkflow(wf)}
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--accent-orange)' }}
                        >
                          Select Workflow
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: CI/CD TELEMETRY CONFIGURATION & VERIFICATION */}
      {step === 5 && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              STEP 5 — CI/CD TELEMETRY CONFIGURATION
            </span>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Configure Live Security Telemetry Endpoint
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Telemetry flows bi-directionally: SentinelAI fetches workflow runs via REST, while GitHub Actions pushes structured security events to your endpoint.
            </p>
          </div>

          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
              FastAPI Ingestion Endpoint URL:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <code style={{
                flex: 1,
                padding: '6px 10px',
                backgroundColor: '#0F172A',
                color: '#F8FAFC',
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}>
                {ingestionEndpoint}
              </code>
              <button
                onClick={handleCopyEndpoint}
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedEndpoint ? <Check size={12} color="var(--status-low-text)" /> : <Copy size={12} />}
                {copiedEndpoint ? 'Copied' : 'Copy Endpoint'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleFinalizeConfig}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '12px' }}
            >
              Complete Setup & Start Live Monitoring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
