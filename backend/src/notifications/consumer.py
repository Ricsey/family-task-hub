import json
import logging
import time

from src.notifications.handlers import handle_task_assignee_changed
from src.notifications.stream import redis_client

logger = logging.getLogger(__name__)

STREAM_NAME = "task_events"
GROUP_NAME = "notification-consumers"
CONSUMER_NAME = "consumer-1"


def _ensure_consumer_group():
    try:
        redis_client.xgroup_create(STREAM_NAME, GROUP_NAME, id="0", mkstream=True)
    except Exception:
        logger.info("Consumer group already exists (or created)")


def run_consumer():
    _ensure_consumer_group()
    logger.info("Event consumer started on stream %s", STREAM_NAME)

    while True:
        try:
            messages = redis_client.xreadgroup(
                groupname=GROUP_NAME,
                consumername=CONSUMER_NAME,
                streams={STREAM_NAME: ">"},
                count=10,
                block=5000,
            )

            if not messages:
                continue

            for stream_name, entries in messages:
                for msg_id, fields in entries:
                    event_type = fields.get(b"type", b"").decode()
                    payload_raw = fields.get(b"payload", b"{}").decode()
                    payload = json.loads(payload_raw)

                    logger.info("Processing event %s: %s", event_type, msg_id)

                    if event_type == "task.assignee_changed":
                        handle_task_assignee_changed(payload)
                    else:
                        logger.warning("Unknown event type: %s", event_type)

                    redis_client.xack(STREAM_NAME, GROUP_NAME, msg_id)

        except Exception as e:
            logger.error("Consumer error: %s", e)
            time.sleep(1)


if __name__ == "__main__":
    run_consumer()
