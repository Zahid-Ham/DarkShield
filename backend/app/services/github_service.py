from typing import Any, Dict, List, Optional
import httpx
from fastapi import HTTPException, status
from app.core.config import settings
from app.schemas.log_event import NormalizedLogEvent
from app.services.normalization import LogNormalizationService


class GitHubService:
    """Isolated GitHub REST API integration service for workflow runs & log telemetry."""

    BASE_URL = "https://api.github.com"

    def __init__(
        self,
        token: Optional[str] = None,
        owner: Optional[str] = None,
        repo: Optional[str] = None
    ):
        self.token = token or settings.GITHUB_TOKEN
        self.owner = owner or settings.GITHUB_OWNER
        self.repo = repo or settings.GITHUB_REPO

    def _get_headers(self) -> Dict[str, str]:
        if not self.token or not self.token.strip():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": "GitHub token unconfigured",
                    "message": "GITHUB_TOKEN is missing or empty in backend settings."
                }
            )
        return {
            "Authorization": f"Bearer {self.token.strip()}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "SIH26-S01-Cybersecurity-Assistant"
        }

    async def get_status(self) -> Dict[str, Any]:
        """Validates configuration, token validity, and rate limit status."""
        if not self.token:
            return {
                "configured": False,
                "owner": self.owner,
                "repo": self.repo,
                "status": "unconfigured",
                "message": "GITHUB_TOKEN is not set."
            }

        headers = self._get_headers()
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                # Test API access via rate_limit endpoint
                response = await client.get(f"{self.BASE_URL}/rate_limit", headers=headers)
                if response.status_code == 401:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail={"error": "Invalid GitHub Token", "message": "GitHub API returned 401 Unauthorized."}
                    )
                elif response.status_code == 403:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail={"error": "GitHub Permission Denied", "message": "Token lacks permission or rate limit exceeded."}
                    )
                elif response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail={"error": "GitHub API Error", "message": f"GitHub returned status code {response.status_code}."}
                    )

                data = response.json()
                core_rate = data.get("resources", {}).get("core", {})

                return {
                    "configured": True,
                    "owner": self.owner,
                    "repo": self.repo,
                    "status": "connected",
                    "rate_limit": {
                        "limit": core_rate.get("limit"),
                        "remaining": core_rate.get("remaining"),
                        "reset_timestamp": core_rate.get("reset")
                    }
                }
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail={"error": "Network Error", "message": f"Failed to connect to GitHub API: {str(exc)}"}
                )

    async def list_workflow_runs(self, limit: int = 10) -> Dict[str, Any]:
        """Lists recent GitHub Actions workflow runs for configured repo."""
        headers = self._get_headers()
        url = f"{self.BASE_URL}/repos/{self.owner}/{self.repo}/actions/runs?per_page={limit}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, headers=headers)
                if response.status_code == 404:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail={"error": "Repository Not Found", "message": f"Repository {self.owner}/{self.repo} not found or inaccessible."}
                    )
                elif response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail={"error": "GitHub Error", "message": f"GitHub returned HTTP {response.status_code}: {response.text}"}
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

                # Fetch jobs
                jobs_res = await client.get(jobs_url, headers=headers)
                jobs_data = jobs_res.json() if jobs_res.status_code == 200 else {"jobs": []}

                # Convert GitHub workflow run + jobs into normalized security log events
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
        # Map GitHub run conclusion to security severity
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

        # Convert job-level events
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
