# SentinelAI CI/CD Telemetry Developer & Operations Guide

This guide outlines the exact step-by-step procedure for running the **SentinelAI CI/CD Security Ingestion Pipeline** locally and connecting live GitHub Actions workflow runs via ngrok.

---

## 🏗️ Architecture Summary

```
   ┌───────────────────────────┐
   │ GitHub Actions Runner     │
   │ (.github/workflows/...)   │
   └─────────────┬─────────────┘
                 │ HTTP POST sentinel_events.json
                 ▼
 ┌───────────────────────────────────────────┐
 │ Public Tunnel (ngrok / localtunnel)       │
 │ https://<subdomain>.ngrok-free.dev        │
 └─────────────┬─────────────────────────────┘
               │ Forwards to localhost:8000
               ▼
 ┌───────────────────────────────────────────┐
 │ FastAPI Backend Engine (Python 3.14)      │
 │ /api/logs/ingest  |  /api/github/*        │
 └─────────────┬─────────────────────────────┘
               │ Standardized JSON Telemetry
               ▼
 ┌───────────────────────────────────────────┐
 │ React.js Operations Workstation (Vite)    │
 │ http://localhost:5173  (Log Ingestion)   │
 └───────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide (3 Terminals Setup)

### 1. Terminal 1 — Start FastAPI Backend Server

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```
- **Backend URL**: `http://127.0.0.1:8000`
- **Swagger Docs**: `http://127.0.0.1:8000/docs`

---

### 2. Terminal 2 — Start React Frontend Workstation

```powershell
cd frontend
npm run dev
```
- **Frontend URL**: `http://localhost:5173`

---

### 3. Terminal 3 — Launch Public ngrok Tunnel

```powershell
cd frontend
node ngrok_tunnel.cjs
```
- **Output Sample**:
  ```text
  NGROK TUNNEL ONLINE: https://venessa-unpronounceable-maryln.ngrok-free.dev
  SENTINEL INGESTION ENDPOINT: https://venessa-unpronounceable-maryln.ngrok-free.dev/api/logs/ingest
  ```

---

## 🔐 GitHub Repository Secret Configuration

1. Open your GitHub Repository: **[https://github.com/Zahid-Ham/DarkShield](https://github.com/Zahid-Ham/DarkShield)**
2. Go to **Settings** -> **Secrets and variables** -> **Actions**.
3. Click **New repository secret**:
   - **Secret Name**: `SENTINEL_INGEST_URL`
   - **Secret Value**: `https://<your-ngrok-subdomain>.ngrok-free.dev/api/logs/ingest`
4. Click **Add secret**.

---

## ⚡ Triggering the CI/CD Pipeline

### Option A: Git Push (Automatic Trigger)
Commit and push any code change to the `main` branch:
```powershell
git commit -m "test: trigger security pipeline telemetry"
git push origin main
```

### Option B: GitHub Actions Tab (Manual Trigger)
1. Go to the **Actions** tab on your GitHub repository.
2. Select **SentinelAI Security Pipeline** on the left menu.
3. Click **Run workflow** -> Select `main` branch -> Click **Run workflow**.

---

## 📊 Viewing Telemetry in SentinelAI Workstation

1. Open `http://localhost:5173` in your browser.
2. Navigate to **Log Ingestion**.
3. Use the Setup Wizard or view live telemetry:
   - **Token Authentication**: Paste your GitHub Personal Access Token (`github_pat_...`).
   - **Target Repository**: Select your repository (e.g. `Zahid-Ham/DarkShield`).
   - **Workflow Inspection**: Click any workflow run to open the **Workflow Run Telemetry Inspector** drawer.
   - **Normalized Events Stream**: Expand any event to copy the full normalized JSON metadata.

---

## 🛠️ Handy CLI Debug Commands

### Test Ingestion Health
```powershell
curl.exe -s "http://127.0.0.1:8000/api/logs/health"
```

### Query Recent Ingested Events
```powershell
curl.exe -s "http://127.0.0.1:8000/api/logs/recent"
```

### Query GitHub Integration Status
```powershell
curl.exe -s "http://127.0.0.1:8000/api/github/status"
```

### Ingest Sample Payload Manually
```powershell
curl.exe -s -H "Content-Type: application/json" -X POST "http://127.0.0.1:8000/api/logs/ingest" -d "@backend/samples/sample_cicd_event.json"
```
