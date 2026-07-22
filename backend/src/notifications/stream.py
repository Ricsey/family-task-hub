import json
import logging

import redis

from src.core.config import settings

logger = logging.getLogger(__name__)

redis_client = redis.Redis.from_url(settings.REDIS_URL)


def publish_event(event_type: str, payload: dict) -> None:
    redis_client.xadd(
        "task_events",
        {"type": event_type, "payload": json.dumps(payload)},
    )
    logger.info("Published event %s: %s", event_type, payload)
