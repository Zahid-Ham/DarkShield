from typing import Any, Dict
from fastapi import APIRouter, Query
from app.services.github_service import GitHubService
from app.services.storage import log_storage
from app.schemas.log_event import NormalizedLogEvent

router = APIRouter(prefix="/github", tags=["GitHub Integration"])


@router.get("/status", summary="Get GitHub Integration Status")
async def get_github_status():
    """
    Returns GitHub configuration status, connection health, and rate limit remaining.
    NEVER exposes the GitHub authorization token.
    """
    service = GitHubService()
    return await service.get_status()


@router.get("/runs", summary="List GitHub Actions Workflow Runs")
async def list_github_runs(
    limit: int = Query(default=10, ge=1, le=50, description="Max number of runs to return")
):
    """
    Lists recent GitHub Actions workflow runs for the configured repository.
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
    If auto_ingest is true, the normalized events are added to the storage engine.
    """
    service = GitHubService()
    details = await service.get_run_details(run_id)

    if auto_ingest and "normalized_events" in details:
        events = [NormalizedLogEvent(**evt) for evt in details["normalized_events"]]
        log_storage.add_events(events)

    return details
