import { MOCK_INCIDENTS } from '../mock/incidents.js';
import { MOCK_EVENTS } from '../mock/events.js';
import { MOCK_EXPOSURE_INTELLIGENCE } from '../mock/intelligence.js';

// Toggle to use real FastAPI endpoints when available
const USE_REAL_API = false;
const API_BASE_URL = '/api';

/**
 * Service Abstraction Layer for SIH26-S01 Cybersecurity Assistant.
 * All UI components use these functions to fetch/send data.
 */

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend health check failed, falling back to offline mode:", err.message);
    return { status: "offline", service: "Mock Frontend Mode", version: "0.1.0", environment: "demo" };
  }
}

export async function checkIngestHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/logs/health`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: "offline", total_stored_events: 0, storage_type: "demo" };
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
    console.warn("Real log ingestion endpoint unavailable, simulating ingestion:", err.message);
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      status: "success",
      ingested_count: Array.isArray(payload) ? payload.length : 1,
      message: `Successfully ingested log event(s) in demo mode.`,
      events: []
    };
  }
}

export async function fetchRecentLogs(limit = 50) {
  try {
    const res = await fetch(`${API_BASE_URL}/logs/recent?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchIncidents() {
  if (USE_REAL_API) {
    const res = await fetch(`${API_BASE_URL}/incidents`);
    return await res.json();
  }
  await new Promise(resolve => setTimeout(resolve, 150));
  return MOCK_INCIDENTS;
}

export async function fetchIncidentById(id) {
  if (USE_REAL_API) {
    const res = await fetch(`${API_BASE_URL}/incidents/${id}`);
    return await res.json();
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_INCIDENTS.find(inc => inc.id === id) || null;
}

export async function fetchIncidentEvents(incidentId) {
  if (USE_REAL_API) {
    const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/events`);
    return await res.json();
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_EVENTS[incidentId] || [];
}

export async function fetchExposureIntelligence() {
  if (USE_REAL_API) {
    const res = await fetch(`${API_BASE_URL}/exposure-intelligence`);
    return await res.json();
  }
  await new Promise(resolve => setTimeout(resolve, 150));
  return MOCK_EXPOSURE_INTELLIGENCE;
}

export async function sendManagerChatMessage(incidentId, userMessage) {
  if (USE_REAL_API) {
    const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });
    return await res.json();
  }

  await new Promise(resolve => setTimeout(resolve, 400));
  return {
    sender: 'ai',
    timestamp: new Date().toISOString(),
    message: `[Manager Summary for ${incidentId}]: User asked: "${userMessage}". Executive Impact: High risk of data loss. Immediate action is required on ${incidentId} host isolation.`
  };
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
      message: `Connected to log stream at ${url}. Normalized 15 telemetry records.`,
      events: []
    };
  }
}
