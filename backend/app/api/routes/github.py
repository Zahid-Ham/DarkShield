from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel
from app.services.github_service import GitHubService, active_session
from app.services.storage import log_storage
from app.schemas.log_event import NormalizedLogEvent

router = APIRouter(prefix="/github", tags=["GitHub Integration"])


class TokenConnectRequest(BaseModel):
    token: str


class ConfigureTargetRequest(BaseModel):
    owner: str
    repo: str
    workflow_name: Optional[str] = None
    workflow_id: Optional[str] = None


@router.post("/connect", summary="Connect and Validate GitHub Token")
async def connect_github_token(req: TokenConnectRequest):
    """
    Validates a user-provided GitHub Personal Access Token.
    Returns status and authenticated username. Token is NEVER returned in response.
    """
    if not req.token or not req.token.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Empty Token", "message": "Personal Access Token cannot be empty."}
        )

    service = GitHubService()
    return await service.connect_and_validate_token(req.token.strip())


@router.get("/repos", summary="List Repositories for Connected User")
async def list_github_repositories():
    """
    Lists GitHub repositories accessible by the authenticated user token.
    """
    service = GitHubService()
    return await service.list_repositories()


@router.get("/repos/{owner}/{repo}/workflows", summary="List Workflows for Selected Repository")
async def list_github_workflows(owner: str, repo: str):
    """
    Lists GitHub Actions workflows for a given repository.
    """
    service = GitHubService()
    return await service.list_workflows(owner=owner, repo=repo)


@router.post("/configure", summary="Configure Active Target Repository & Workflow")
async def configure_github_target(req: ConfigureTargetRequest):
    """
    Sets the target repository and workflow for active session monitoring.
    """
    service = GitHubService()
    return await service.configure_target_telemetry(
        owner=req.owner,
        repo=req.repo,
        workflow_name=req.workflow_name,
        workflow_id=req.workflow_id
    )


@router.get("/status", summary="Get GitHub Integration Status")
async def get_github_status():
    """
    Returns active GitHub configuration status, owner, repo, and rate limit.
    NEVER exposes the GitHub authorization token.
    """
    service = GitHubService()
    return await service.get_status()


@router.get("/runs", summary="List GitHub Actions Workflow Runs")
async def list_github_runs(
    limit: int = Query(default=10, ge=1, le=50, description="Max number of runs to return")
):
    """
    Lists recent GitHub Actions workflow runs for the active configured repository.
    """
    service = GitHubService()
    return await service.list_workflow_runs(limit=limit)


@router.get("/runs/{run_id}", summary="Get Workflow Run Details & Normalized Events")
async def get_github_run_details(
    run_id: str,
    auto_ingest: bool = Query(default=True, description="Auto-persist normalized run events to storage")
):
    """
    Retrieves workflow run details, jobs, and converts them into normalized security log events.
    """
    service = GitHubService()
    details = await service.get_run_details(run_id)

    if auto_ingest and "normalized_events" in details:
        events = [NormalizedLogEvent(**evt) for evt in details["normalized_events"]]
        log_storage.add_events(events)

    return details
