from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, ConfigDict


class RawLogEvent(BaseModel):
    """Flexible incoming unnormalized log event model for external CI/CD pipelines."""
    model_config = ConfigDict(extra="allow")

    timestamp: Optional[Union[datetime, str]] = None
    source: Optional[str] = None
    pipeline: Optional[str] = None
    repository: Optional[str] = None
    workflow: Optional[str] = None
    run_id: Optional[Union[str, int]] = None
    job: Optional[str] = None
    stage: Optional[str] = None
    event_type: Optional[str] = None
    severity: Optional[str] = None
    message: Optional[str] = None
    user: Optional[str] = None
    host: Optional[str] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class NormalizedLogEvent(BaseModel):
    """Consistent internal normalized security log event schema."""
    event_id: str
    timestamp: str
    source: str
    pipeline: Optional[str] = "unspecified"
    repository: Optional[str] = "unspecified"
    workflow: Optional[str] = "unspecified"
    run_id: Optional[str] = "unspecified"
    job: Optional[str] = "unspecified"
    stage: Optional[str] = "unspecified"
    event_type: str = "generic_event"
    severity: str = "INFO"
    message: str = ""
    user: Optional[str] = "unknown"
    host: Optional[str] = "unknown"
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LogIngestResponse(BaseModel):
    """Response payload returned after log ingestion."""
    status: str = "success"
    ingested_count: int
    message: str
    events: List[NormalizedLogEvent]


class LogHealthResponse(BaseModel):
    """Ingestion service health and statistics."""
    status: str = "healthy"
    total_stored_events: int
    storage_type: str = "memory"
