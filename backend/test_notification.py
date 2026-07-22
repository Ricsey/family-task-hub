"""Test the full notification pipeline directly, bypassing API and Redis."""
from src.notifications.handlers import handle_task_assignee_changed
from src.notifications.stream import redis_client

# Scenario: reassign task from test@tester.com to tester_rendes@domain.com
payload = {
    "task_id": 99,
    "task_title": "E2E Test Task",
    "task_category": "Chore",
    "task_due_date": "2026-08-01",
    "previous_assignee_id": "dc93580d-6133-412d-bbce-611207a6046f",
    "previous_assignee_email": "test@tester.com",
    "new_assignee_id": "cb24ebc6-16c2-4eb2-8d6d-c62fc3c005cb",
    "new_assignee_email": "tester_rendes@domain.com",
    "new_assignee_name": "Tester Rendes",
    "actor_id": "c48b5ec9-bbb1-4e10-bf0e-c1124567f953",
    "actor_name": "Richard Allili",
}

print("Publishing event to Redis stream...")
from src.notifications.stream import publish_event
publish_event("task.assignee_changed", payload)
print("Published.")

# Also call the handler directly so you see output immediately
print("\nCalling handler directly...")
handle_task_assignee_changed(payload)
print("Handler done. Check the Celery worker logs above.")
