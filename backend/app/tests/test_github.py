from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def test_github_status_endpoint():
    response = client.get("/api/github/status")
    assert response.status_code in [200, 401, 503]
    data = response.json()

    # Ensure token is NEVER returned in response
    response_str = response.text
    if settings.GITHUB_TOKEN:
        assert settings.GITHUB_TOKEN not in response_str

    if response.status_code == 200:
        assert "configured" in data
        assert "owner" in data
        assert "repo" in data


def test_github_token_secrecy():
    """Security check to guarantee GITHUB_TOKEN string is never leaked in API outputs."""
    if not settings.GITHUB_TOKEN:
        return

    status_res = client.get("/api/github/status")
    assert settings.GITHUB_TOKEN not in status_res.text

    runs_res = client.get("/api/github/runs")
    assert settings.GITHUB_TOKEN not in runs_res.text

    details_res = client.get("/api/github/runs/12345678")
    assert settings.GITHUB_TOKEN not in details_res.text
