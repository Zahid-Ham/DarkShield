from typing import Any, Dict, List, Optional, Union
import httpx
from fastapi import HTTPException, status
from app.core.config import settings
from app.schemas.log_event import NormalizedLogEvent
from app.services.normalization import LogNormalizationService


class GitHubSessionConfig:
    """In-memory active session configuration for user-connected GitHub integration."""
    token: Optional[str] = None
    authenticated_user: Optional[str] = None
    owner: Optional[str] = None
    repo: Optional[str] = None
    selected_workflow: Optional[str] = None
    workflow_id: Optional[str] = None
    status: str = "disconnected"  # "disconnected", "connected", "configured", "monitoring"


# Global runtime session state
active_session = GitHubSessionConfig()

# Fallback to backend config if provided
if settings.GITHUB_TOKEN and settings.GITHUB_TOKEN.strip():
    active_session.token = settings.GITHUB_TOKEN.strip()
    active_session.owner = settings.GITHUB_OWNER
    active_session.repo = settings.GITHUB_REPO
    active_session.status = "connected"


class GitHubService:
    """Isolated GitHub REST API integration service supporting dynamic user connection flow."""

    BASE_URL = "https://api.github.com"

    def __init__(
        self,
        token: Optional[str] = None,
        owner: Optional[str] = None,
        repo: Optional[str] = None
    ):
        self.token = token or active_session.token or settings.GITHUB_TOKEN
        self.owner = owner or active_session.owner or settings.GITHUB_OWNER
        self.repo = repo or active_session.repo or settings.GITHUB_REPO

    def _get_headers(self, custom_token: Optional[str] = None) -> Dict[str, str]:
        token_to_use = custom_token or self.token
        if not token_to_use or not token_to_use.strip():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": "GitHub token unconfigured",
                    "message": "GitHub Personal Access Token is required. Please connect your GitHub account."
                }
            )
        return {
            "Authorization": f"Bearer {token_to_use.strip()}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "SIH26-S01-Cybersecurity-Assistant"
        }

    async def connect_and_validate_token(self, token: str) -> Dict[str, Any]:
        """Validates a user-provided Personal Access Token and returns authenticated user login."""
        headers = self._get_headers(custom_token=token)
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(f"{self.BASE_URL}/user", headers=headers)
                if res.status_code == 401:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail={
                            "error": "Invalid GitHub Token",
                            "message": "The provided GitHub Personal Access Token is invalid or expired."
                        }
                    )
                elif res.status_code == 403:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail={
                            "error": "Insufficient Permissions",
                            "message": "Token lacks required permissions (Actions: Read, Metadata: Read)."
                        }
                    )
                elif res.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail={
                            "error": "GitHub API Unavailable",
                            "message": f"GitHub API responded with status code {res.status_code}."
                        }
                    )

                user_data = res.json()
                username = user_data.get("login", "authenticated_user")

                # Update active session state
                active_session.token = token.strip()
                active_session.authenticated_user = username
                active_session.status = "connected"

                return {
                    "status": "connected",
                    "authenticated_user": username,
                    "message": f"Successfully authenticated as GitHub user '{username}'."
                }
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail={
                        "error": "Network Connection Failed",
                        "message": f"Failed to connect to GitHub API: {str(exc)}"
                    }
                )

    async def list_repositories(self) -> List[Dict[str, Any]]:
        """Lists accessible repositories for the authenticated user."""
        headers = self._get_headers()
        url = f"{self.BASE_URL}/user/repos?per_page=100&sort=updated"

        async with httpx.AsyncClient(timeout=12.0) as client:
            try:
                res = await client.get(url, headers=headers)
                if res.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail={
                            "error": "Failed Fetching Repositories",
                            "message": f"GitHub returned HTTP {res.status_code} when querying repositories."
                        }
                    )

                raw_repos = res.json()
                result = []
                for repo in raw_repos:
                    result.append({
                        "name": repo.get("name"),
                        "full_name": repo.get("full_name"),
                        "owner": repo.get("owner", {}).get("login"),
                        "default_branch": repo.get("default_branch", "main"),
                        "private": repo.get("private", False),
                        "description": repo.get("description", ""),
                        "html_url": repo.get("html_url")
                    })
                return result
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail={"error": "Connection Timeout", "message": f"Network error listing repositories: {str(exc)}"}
                )

    async def list_workflows(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        """Lists GitHub Actions workflows for a specific repository."""
        headers = self._get_headers()
        url = f"{self.BASE_URL}/repos/{owner}/{repo}/actions/workflows"

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(url, headers=headers)
                if res.status_code == 404:
                    return []
                elif res.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail={"error": "GitHub Error", "message": f"HTTP {res.status_code} querying workflows for {owner}/{repo}"}
                    )

                data = res.json()
                workflows = data.get("workflows", [])
                result = []
                for wf in workflows:
                    result.append({
                        "id": str(wf.get("id")),
                        "name": wf.get("name"),
                        "path": wf.get("path"),
                        "state": wf.get("state"),
                        "badge_url": wf.get("badge_url"),
                        "html_url": wf.get("html_url")
                    })
                return result
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail={"error": "Connection Failed", "message": f"Failed reaching GitHub workflows API: {str(exc)}"}
                )

    async def configure_target_telemetry(
        self,
        owner: str,
        repo: str,
        workflow_name: Optional[str] = None,
        workflow_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Sets the selected target repository and workflow for active session monitoring."""
        active_session.owner = owner
        active_session.repo = repo
        active_session.selected_workflow = workflow_name
        active_session.workflow_id = workflow_id
        active_session.status = "monitoring"

        self.owner = owner
        self.repo = repo

        return {
            "status": "monitoring",
            "owner": owner,
            "repo": repo,
            "selected_workflow": workflow_name,
            "message": f"SentinelAI is now actively monitoring CI/CD telemetry for '{owner}/{repo}'."
        }

    async def get_status(self) -> Dict[str, Any]:
        """Validates configuration, session state, and rate limits. NEVER exposes token."""
        if not active_session.token:
            return {
                "configured": False,
                "authenticated_user": None,
                "owner": None,
                "repo": None,
                "selected_workflow": None,
                "status": "disconnected",
                "message": "GitHub account is not connected. Connect a GitHub Personal Access Token to proceed."
            }

        headers = self._get_headers()
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(f"{self.BASE_URL}/rate_limit", headers=headers)
                if res.status_code == 401:
                    active_session.status = "disconnected"
                    return {
                        "configured": False,
                        "status": "disconnected",
                        "message": "GitHub Token is invalid or expired."
                    }

                data = res.json()
                core_rate = data.get("resources", {}).get("core", {})

                return {
                    "configured": True,
                    "authenticated_user": active_session.authenticated_user,
                    "owner": active_session.owner,
                    "repo": active_session.repo,
                    "selected_workflow": active_session.selected_workflow,
                    "status": active_session.status,
                    "rate_limit": {
                        "limit": core_rate.get("limit"),
                        "remaining": core_rate.get("remaining"),
                        "reset_timestamp": core_rate.get("reset")
                    }
                }
            except httpx.RequestError as exc:
                return {
                    "configured": False,
                    "status": "disconnected",
                    "message": f"Failed reaching GitHub API: {str(exc)}"
                }

    async def list_workflow_runs(self, limit: int = 10) -> Dict[str, Any]:
        """Lists recent GitHub Actions workflow runs for configured repo."""
        if not self.owner or not self.repo:
            return {
                "owner": "Not configured",
                "repo": "Not configured",
                "total_count": 0,
                "runs": []
            }

        headers = self._get_headers()
        url = f"{self.BASE_URL}/repos/{self.owner}/{self.repo}/actions/runs?per_page={limit}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, headers=headers)
                if response.status_code == 404:
                    return {
                        "owner": self.owner,
                        "repo": self.repo,
                        "total_count": 0,
                        "runs": []
                    }
                elif response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail={"error": "GitHub Error", "message": f"GitHub returned HTTP {response.status_code}"}
                    )

                data = response.json()
                raw_runs = data.get("workflow_runs", [])

                runs_summary = []
                for run in raw_runs:
                    runs_summary.append({
                        "id": run.get("id"),
                        "name": run.get("name"),
                        "workflow_id": run.get("workflow_id"),
                        "head_branch": run.get("head_branch"),
                        "event": run.get("event"),
                        "status": run.get("status"),
                        "conclusion": run.get("conclusion"),
                        "actor": run.get("actor", {}).get("login"),
                        "created_at": run.get("created_at"),
                        "updated_at": run.get("updated_at"),
                        "html_url": run.get("html_url")
                    })

                return {
                    "owner": self.owner,
                    "repo": self.repo,
                    "total_count": data.get("total_count", 0),
                    "runs": runs_summary
                }
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail={"error": "Connection Failed", "message": f"Failed to reach GitHub API: {str(exc)}"}
                )

    async def get_run_details(self, run_id: Union[int, str]) -> Dict[str, Any]:
        """Retrieves run metadata, associated jobs, and converts them into normalized security events."""
        if not self.owner or not self.repo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Target Repository Unconfigured", "message": "Select a target repository first."}
            )

        headers = self._get_headers()
        run_url = f"{self.BASE_URL}/repos/{self.owner}/{self.repo}/actions/runs/{run_id}"
        jobs_url = f"{self.BASE_URL}/repos/{self.owner}/{self.repo}/actions/runs/{run_id}/jobs"

        async with httpx.AsyncClient(timeout=12.0) as client:
            try:
                run_res = await client.get(run_url, headers=headers)
                if run_res.status_code == 404:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail={"error": "Run Not Found", "message": f"Workflow run ID {run_id} not found."}
                    )
                elif run_res.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail={"error": "GitHub Error", "message": f"Failed to fetch run {run_id}: HTTP {run_res.status_code}"}
                    )

                run_data = run_res.json()
                jobs_res = await client.get(jobs_url, headers=headers)
                jobs_data = jobs_res.json() if jobs_res.status_code == 200 else {"jobs": []}

                normalized_events = self._convert_run_to_normalized_events(run_data, jobs_data.get("jobs", []))

                return {
                    "run_id": run_data.get("id"),
                    "name": run_data.get("name"),
                    "status": run_data.get("status"),
                    "conclusion": run_data.get("conclusion"),
                    "actor": run_data.get("actor", {}).get("login"),
                    "repository": self.repo,
                    "owner": self.owner,
                    "html_url": run_data.get("html_url"),
                    "jobs_count": len(jobs_data.get("jobs", [])),
                    "normalized_events": [event.model_dump() for event in normalized_events]
                }
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail={"error": "Connection Error", "message": f"Failed contacting GitHub: {str(exc)}"}
                )

    def _convert_run_to_normalized_events(
        self,
        run_data: Dict[str, Any],
        jobs: List[Dict[str, Any]]
    ) -> List[NormalizedLogEvent]:
        """Converts GitHub Action run & job JSON structures into NormalizedLogEvent records."""
        events: List[NormalizedLogEvent] = []

        conclusion = run_data.get("conclusion")
        run_severity = "HIGH" if conclusion == "failure" else "MEDIUM" if conclusion == "timed_out" else "INFO"

        run_raw = {
            "source": "github_actions",
            "pipeline": "github_actions",
            "repository": f"{self.owner}/{self.repo}",
            "workflow": run_data.get("name"),
            "run_id": str(run_data.get("id")),
            "event_type": f"workflow_run_{run_data.get('status')}",
            "severity": run_severity,
            "message": f"Workflow '{run_data.get('name')}' run ID {run_data.get('id')} finished with conclusion: {conclusion}",
            "user": run_data.get("actor", {}).get("login"),
            "timestamp": run_data.get("created_at"),
            "metadata": {
                "head_sha": run_data.get("head_sha"),
                "event": run_data.get("event"),
                "html_url": run_data.get("html_url")
            }
        }
        events.append(LogNormalizationService.normalize_event(run_raw))

        for job in jobs:
            job_conclusion = job.get("conclusion")
            job_severity = "HIGH" if job_conclusion == "failure" else "INFO"

            job_raw = {
                "source": "github_actions",
                "pipeline": "github_actions",
                "repository": f"{self.owner}/{self.repo}",
                "workflow": run_data.get("name"),
                "run_id": str(run_data.get("id")),
                "job": job.get("name"),
                "stage": job.get("runner_name"),
                "event_type": "job_execution",
                "severity": job_severity,
                "message": f"Job '{job.get('name')}' on runner '{job.get('runner_name')}' status: {job.get('status')}, conclusion: {job_conclusion}",
                "user": run_data.get("actor", {}).get("login"),
                "host": job.get("runner_name"),
                "timestamp": job.get("started_at"),
                "metadata": {
                    "job_id": job.get("id"),
                    "steps_count": len(job.get("steps", [])),
                    "runner_group": job.get("runner_group_name")
                }
            }
            events.append(LogNormalizationService.normalize_event(job_raw))

        return events
