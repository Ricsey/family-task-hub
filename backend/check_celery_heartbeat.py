import redis
r = redis.Redis.from_url("redis://redis:6379")
keys = [k.decode() for k in r.keys("*") if b"celery" in k or b"worker" in k]
for k in sorted(keys):
    print(k)
r.close()
