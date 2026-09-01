from fastapi.testclient import TestClient
from app.main import app
from app.services.storage import log_storage

client = TestClient(app)


def setup_function():
    log_storage.clear()


def test_ingest_health():
    response = client.get("/api/logs/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "total_stored_events" in data


def test_ingest_single_event():
    event_data = {
        "source": "github_actions",
        "pipeline": "ci-build",
        "repository": "Zahid-Ham/DarkShield",
        "event_type": "build_failed",
        "severity": "HIGH",
        "message": "Build failed due to dependency check violation",
        "user": "alice"
    }
    response = client.post("/api/logs/ingest", json=event_data)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["ingested_count"] == 1
    assert len(data["events"]) == 1
    event = data["events"][0]
    assert event["source"] == "github_actions"
    assert event["repository"] == "Zahid-Ham/DarkShield"
    assert event["severity"] == "HIGH"
    assert event["user"] == "alice"
    assert event["event_id"].startswith("EVT-")


def test_ingest_batch_events_and_provider_agnostic_aliases():
    batch_data = [
        {
            "log_source": "jenkins",
            "repo": "corp/payment-service",
            "actor": "bob",
            "level": "critical",
            "log": "Unauthorized database access attempt",
            "ip": "10.0.0.5"
        },
        {
            "source": "gitlab_ci",
            "pipeline_name": "deploy-prod",
            "event_name": "k8s_deploy_success",
            "severity": "info",
            "message": "Deploy completed"
        }
    ]
    response = client.post("/api/logs/ingest", json=batch_data)
    assert response.status_code == 201
    data = response.json()
    assert data["ingested_count"] == 2

    # Check recent retrieval
    recent_res = client.get("/api/logs/recent?limit=10")
    assert recent_res.status_code == 200
    recent_events = recent_res.json()
    assert len(recent_events) == 2

    # Verify alias mapping
    event1 = [e for e in recent_events if e["repository"] == "corp/payment-service"][0]
    assert event1["user"] == "bob"
    assert event1["severity"] == "CRITICAL"
    assert event1["source_ip"] == "10.0.0.5"


def test_ingest_malformed_item():
    response = client.post(
        "/api/logs/ingest",
        content="not valid json",
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert data["detail"]["error"] == "Malformed JSON payload"


def test_ingest_empty_list():
    response = client.post("/api/logs/ingest", json=[])
    assert response.status_code == 400
    data = response.json()
    assert data["detail"]["error"] == "Empty list"
