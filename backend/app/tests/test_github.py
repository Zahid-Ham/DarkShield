from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def test_github_status_endpoint():
    response = client.get("/api/github/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data

    # Ensure token is NEVER returned in response
    if settings.GITHUB_TOKEN:
        assert settings.GITHUB_TOKEN not in response.text


def test_connect_invalid_token():
    response = client.post("/api/github/connect", json={"token": "invalid_test_token_12345"})
    assert response.status_code in [401, 503]
    data = response.json()
    assert "detail" in data


def test_github_token_secrecy():
    """Security check to guarantee token string is never leaked in API outputs."""
    status_res = client.get("/api/github/status")
    assert "token" not in status_res.json()

    if settings.GITHUB_TOKEN:
        assert settings.GITHUB_TOKEN not in status_res.text
