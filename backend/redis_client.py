import os
import redis

REDIS_URL = os.environ.get("REDIS_URL","redis://127.0.0.1:6379/0")

redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True
)