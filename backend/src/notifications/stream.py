import json
import logging

import redis

from src.core.config import settings

logger = logging.getLogger(__name__)

redis_client = redis.Redis.from_url(settings.REDIS_URL)


def publish_event(event_type: str, payload: dict) -> None:
    try:
        redis_client.xadd(
            "task_events",
            {"type": event_type, "payload": json.dumps(payload)},
            maxlen=10000,
        )
        logger.info("Published event %s: %s", event_type, payload)
    except redis.RedisError as e:
        logger.warning("Failed to publish event %s: %s", event_type, e)
