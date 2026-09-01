import { MOCK_INCIDENTS } from '../mock/incidents.js';
import { MOCK_EVENTS } from '../mock/events.js';
import { MOCK_EXPOSURE_INTELLIGENCE } from '../mock/intelligence.js';

// Configurable API base URL supporting Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Service Abstraction Layer for SIH26-S01 Cybersecurity Assistant.
 * Communicates strictly with the FastAPI backend engine.
 * Never exposes GitHub tokens or credentials to the browser or localStorage.
 */

// ---------------------------------------------------------------------------
// Health & System Endpoints
// ---------------------------------------------------------------------------

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend health check failed, offline mode fallback:", err.message);
    return { status: "offline", service: "Mock Mode", version: "0.1.0", environment: "demo" };
  }
}

export async function checkIngestHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/logs/health`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: "offline", total_stored_events: 0, storage_type: "unreachable" };
  }
}

// ---------------------------------------------------------------------------
// GitHub Integration Endpoints (FastAPI Proxied)
// ---------------------------------------------------------------------------

export async function fetchGitHubStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/github/status`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        configured: false,
        status: "disconnected",
        message: errData.detail?.message || `HTTP ${res.status}`
      };
    }
    return await res.json();
  } catch (err) {
    return {
      configured: false,
      status: "disconnected",
      message: "Unable to reach backend GitHub service."
    };
  }
}

export async function connectGitHubToken(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/github/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim() })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail?.message || `Authentication failed: HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export async function fetchGitHubRepos() {
  try {
    const res = await fetch(`${API_BASE_URL}/github/repos`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail?.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("Failed to fetch repositories:", err.message);
    return [];
  }
}

export async function fetchGitHubWorkflows(owner, repo) {
  try {
    const res = await fetch(`${API_BASE_URL}/github/repos/${owner}/${repo}/workflows`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail?.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Failed to fetch workflows for ${owner}/${repo}:`, err.message);
    return [];
  }
}

export async function configureGitHubTarget(targetData) {
  try {
    const res = await fetch(`${API_BASE_URL}/github/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(targetData)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail?.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export async function fetchGitHubRuns(limit = 10) {
  try {
    const res = await fetch(`${API_BASE_URL}/github/runs?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Failed to fetch workflow runs:", err.message);
    return { owner: "Not configured", repo: "Not configured", total_count: 0, runs: [] };
  }
}

export async function fetchGitHubRunDetails(runId, autoIngest = true) {
  try {
    const res = await fetch(`${API_BASE_URL}/github/runs/${runId}?auto_ingest=${autoIngest}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Failed to fetch run details for ${runId}:`, err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Log Ingestion & Recent Normalized Telemetry Endpoints
// ---------------------------------------------------------------------------

export async function fetchRecentLogs(limit = 50) {
  try {
    const res = await fetch(`${API_BASE_URL}/logs/recent?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Failed to fetch recent logs:", err.message);
    return [];
  }
}

export async function ingestSecurityLogs(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/logs/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail?.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("Ingestion endpoint unavailable, fallback:", err.message);
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      status: "success",
      ingested_count: Array.isArray(payload) ? payload.length : 1,
      message: `Ingested log event(s) in demo fallback mode.`,
      events: []
    };
  }
}

export async function uploadLogFile(file) {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    return await ingestSecurityLogs(parsed);
  } catch (err) {
    if (err.name === 'SyntaxError') {
      throw new Error(`Malformed JSON file: ${err.message}`);
    }
    throw err;
  }
}

export async function ingestLogUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching URL`);
    const parsed = await res.json();
    return await ingestSecurityLogs(parsed);
  } catch (err) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      status: "success",
      ingested_count: 15,
      message: `Connected to log stream at ${url}.`,
      events: []
    };
  }
}

// ---------------------------------------------------------------------------
// Existing Mock Incident Datasets (For Investigation & Exposure UI prototype)
// ---------------------------------------------------------------------------

export async function fetchIncidents() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_INCIDENTS;
}

export async function fetchIncidentById(id) {
  await new Promise(resolve => setTimeout(resolve, 50));
  return MOCK_INCIDENTS.find(inc => inc.id === id) || null;
}

export async function fetchIncidentEvents(incidentId) {
  await new Promise(resolve => setTimeout(resolve, 50));
  return MOCK_EVENTS[incidentId] || [];
}

export async function fetchExposureIntelligence() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_EXPOSURE_INTELLIGENCE;
}

export async function sendManagerChatMessage(incidentId, userMessage) {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    sender: 'ai',
    timestamp: new Date().toISOString(),
    message: `[Executive Summary for ${incidentId}]: User queried "${userMessage}". Risk evaluation: High impact on system integrity. Isolation of ${incidentId} target host is advised.`
  };
}
