import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Union
from app.schemas.log_event import RawLogEvent, NormalizedLogEvent

# Standard severity mapping
SEVERITY_MAP = {
    "CRIT": "CRITICAL",
    "CRITICAL": "CRITICAL",
    "FATAL": "CRITICAL",
    "HIGH": "HIGH",
    "WARN": "MEDIUM",
    "WARNING": "MEDIUM",
    "MED": "MEDIUM",
    "MEDIUM": "MEDIUM",
    "LOW": "LOW",
    "INFO": "INFO",
    "INFORMATIONAL": "INFO",
    "DEBUG": "INFO"
}

# Alias resolution mapping for provider-agnostic field normalization
FIELD_ALIASES = {
    "repository": ["repository", "repo", "repo_name", "git_repo"],
    "pipeline": ["pipeline", "pipeline_name", "ci_pipeline", "provider"],
    "workflow": ["workflow", "workflow_name", "action_name"],
    "run_id": ["run_id", "runId", "build_id", "build_number", "execution_id"],
    "job": ["job", "job_name", "step_name"],
    "stage": ["stage", "phase", "environment"],
    "event_type": ["event_type", "type", "action", "event_name", "log_type"],
    "severity": ["severity", "level", "log_level", "risk_level"],
    "message": ["message", "msg", "log", "summary", "description"],
    "user": ["user", "username", "actor", "author", "committer", "initiated_by"],
    "host": ["host", "hostname", "runner_name", "agent_name", "server"],
    "source_ip": ["source_ip", "src_ip", "client_ip", "ip", "remote_addr"],
    "destination_ip": ["destination_ip", "dst_ip", "target_ip"],
    "source": ["source", "log_source", "system_source"]
}


class LogNormalizationService:
    """Provider-agnostic normalization service converting raw security events into standardized records."""

    @staticmethod
    def _extract_alias(data: Dict[str, Any], canonical_key: str, default: Any = None) -> Any:
        aliases = FIELD_ALIASES.get(canonical_key, [canonical_key])
        for alias in aliases:
            if alias in data and data[alias] is not None:
                return data[alias]
        return default

    @staticmethod
    def _parse_timestamp(raw_ts: Any) -> str:
        if isinstance(raw_ts, datetime):
            return raw_ts.isoformat()
        if isinstance(raw_ts, str) and raw_ts.strip():
            try:
                # Attempt to parse standard ISO format
                parsed = datetime.fromisoformat(raw_ts.replace("Z", "+00:00"))
                return parsed.isoformat()
            except ValueError:
                return raw_ts
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _normalize_severity(raw_severity: Any) -> str:
        if not raw_severity or not isinstance(raw_severity, str):
            return "INFO"
        clean = raw_severity.strip().upper()
        return SEVERITY_MAP.get(clean, "INFO")

    @classmethod
    def normalize_event(cls, raw_input: Union[RawLogEvent, Dict[str, Any]]) -> NormalizedLogEvent:
        if isinstance(raw_input, RawLogEvent):
            data = raw_input.model_dump(exclude_unset=False)
        elif isinstance(raw_input, dict):
            data = raw_input
        else:
            data = {}

        # Extract canonical fields using provider-agnostic aliases
        source = str(cls._extract_alias(data, "source", "generic_cicd"))
        pipeline = cls._extract_alias(data, "pipeline")
        repository = cls._extract_alias(data, "repository")
        workflow = cls._extract_alias(data, "workflow")
        run_id = str(cls._extract_alias(data, "run_id")) if cls._extract_alias(data, "run_id") is not None else None
        job = cls._extract_alias(data, "job")
        stage = cls._extract_alias(data, "stage")
        event_type = str(cls._extract_alias(data, "event_type", "cicd_security_event"))
        severity = cls._normalize_severity(cls._extract_alias(data, "severity"))
        message = str(cls._extract_alias(data, "message", ""))
        user = cls._extract_alias(data, "user")
        host = cls._extract_alias(data, "host")
        source_ip = cls._extract_alias(data, "source_ip")
        destination_ip = cls._extract_alias(data, "destination_ip")
        timestamp = cls._parse_timestamp(cls._extract_alias(data, "timestamp"))

        # Collect unmapped extra fields into metadata
        canonical_used_keys = set()
        for key_aliases in FIELD_ALIASES.values():
            canonical_used_keys.update(key_aliases)

        existing_metadata = data.get("metadata", {})
        if not isinstance(existing_metadata, dict):
            existing_metadata = {"raw_metadata": str(existing_metadata)}

        extra_metadata = {
            k: v for k, v in data.items()
            if k not in canonical_used_keys and k != "metadata"
        }
        combined_metadata = {**existing_metadata, **extra_metadata}

        return NormalizedLogEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
            timestamp=timestamp,
            source=source,
            pipeline=pipeline,
            repository=repository,
            workflow=workflow,
            run_id=run_id,
            job=job,
            stage=stage,
            event_type=event_type,
            severity=severity,
            message=message,
            user=user,
            host=host,
            source_ip=source_ip,
            destination_ip=destination_ip,
            metadata=combined_metadata
        )

    @classmethod
    def normalize_batch(cls, raw_events: List[Union[RawLogEvent, Dict[str, Any]]]) -> List[NormalizedLogEvent]:
        return [cls.normalize_event(evt) for evt in raw_events]
