from threading import Lock
from typing import List
from app.schemas.log_event import NormalizedLogEvent


class LogStorageService:
    """Development-friendly in-memory thread-safe event storage."""

    def __init__(self, max_capacity: int = 1000):
        self._events: List[NormalizedLogEvent] = []
        self._lock = Lock()
        self._max_capacity = max_capacity

    def add_events(self, events: List[NormalizedLogEvent]) -> None:
        with self._lock:
            for event in events:
                self._events.insert(0, event)  # Newest first
            # Trim if capacity exceeded
            if len(self._events) > self._max_capacity:
                self._events = self._events[:self._max_capacity]

    def get_recent_events(self, limit: int = 50) -> List[NormalizedLogEvent]:
        with self._lock:
            return list(self._events[:limit])

    def get_total_count(self) -> int:
        with self._lock:
            return len(self._events)

    def clear(self) -> None:
        with self._lock:
            self._events.clear()


# Global singleton instance for app state
log_storage = LogStorageService()
