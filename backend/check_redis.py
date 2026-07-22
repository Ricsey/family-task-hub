import json
import redis

r = redis.Redis.from_url("redis://redis:6379")
msgs = r.xrange("task_events", "-", "+")
for msg_id, fields in msgs:
    payload = json.loads(fields[b"payload"])
    print(f'{msg_id.decode()}: new_assignee_email={payload.get("new_assignee_email")} | new_assignee_name={payload.get("new_assignee_name")} | actor_id={payload.get("actor_id")}')
print(f"Total: {len(msgs)} messages")
r.close()
