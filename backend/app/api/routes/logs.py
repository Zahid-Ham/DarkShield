from typing import Any, Dict, List, Union
from fastapi import APIRouter, HTTPException, Request, Query, status
from pydantic import ValidationError

from app.schemas.log_event import (
    RawLogEvent,
    NormalizedLogEvent,
    LogIngestResponse,
    LogHealthResponse
)
from app.services.normalization import LogNormalizationService
from app.services.storage import log_storage

router = APIRouter(prefix="/logs", tags=["Log Ingestion"])


@router.post(
    "/ingest",
    response_model=LogIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest JSON Security Logs"
)
async def ingest_logs(request: Request):
    """
    Ingests structured JSON security logs from external CI/CD pipelines, SIEMs, or webhooks.
    Accepts single event JSON object or array of event JSON objects.
    """
    try:
        payload = await request.json()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Malformed JSON payload",
                "message": f"Failed to parse request body as valid JSON: {str(exc)}"
            }
        )

    if not payload and payload != []:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Empty payload",
                "message": "The ingestion payload cannot be empty."
            }
        )

    # Standardize input into list of dicts
    if isinstance(payload, dict):
        raw_events_list = [payload]
    elif isinstance(payload, list):
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Empty list", "message": "Provided event list is empty."}
            )
        raw_events_list = payload
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Invalid JSON format",
                "message": "Expected JSON object or array of objects."
            }
        )

    # Validate elements are dicts
    validated_raw_events = []
    for idx, item in enumerate(raw_events_list):
        if not isinstance(item, dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Invalid event item",
                    "message": f"Item at index {idx} is not a valid JSON object."
                }
            )
        try:
            # Parse via RawLogEvent model to validate structure
            raw_event = RawLogEvent(**item)
            validated_raw_events.append(raw_event)
        except ValidationError as val_err:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Schema validation failed",
                    "message": f"Validation error at index {idx}: {val_err.errors()}"
                }
            )

    # Normalize events via provider-agnostic service
    normalized_events = LogNormalizationService.normalize_batch(validated_raw_events)

    # Persist in storage
    log_storage.add_events(normalized_events)

    return LogIngestResponse(
        status="success",
        ingested_count=len(normalized_events),
        message=f"Successfully ingested and normalized {len(normalized_events)} log event(s).",
        events=normalized_events
    )


@router.get(
    "/recent",
    response_model=List[NormalizedLogEvent],
    summary="Get Recent Normalized Events"
)
async def get_recent_logs(
    limit: int = Query(default=50, ge=1, le=500, description="Max number of recent events to return")
):
    """Returns stored normalized events sorted by most recent first."""
    return log_storage.get_recent_events(limit=limit)


@router.get(
    "/health",
    response_model=LogHealthResponse,
    summary="Log Ingestion Health Check"
)
async def get_ingest_health():
    """Returns ingestion engine health and total stored event count."""
    return LogHealthResponse(
        status="healthy",
        total_stored_events=log_storage.get_total_count(),
        storage_type="in-memory"
    )
