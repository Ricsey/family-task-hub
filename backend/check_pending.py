import redis

r = redis.Redis.from_url("redis://redis:6379")

groups = r.xinfo_groups("task_events")
print("Groups:", groups)

for g in groups:
    name = g["name"]
    pending = r.xpending("task_events", name)
    print(f"  {name.decode()}: pending={pending['pending']}, min={pending['min']}, max={pending['max']}")

    consumers = r.xinfo_consumers("task_events", name)
    for c in consumers:
        print(f"    consumer={c['name'].decode()}: pending={c['pending']}, idle={c['idle']}ms")

r.close()
