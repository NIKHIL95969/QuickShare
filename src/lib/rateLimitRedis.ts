import { getRedisClient } from './redisClient';

const RATE_LIMIT = 40; // requests
const WINDOW_SEC = 60; // 1 minute

export async function rateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const redis = await getRedisClient();
  const key = `${process.env.ENV}:rate-limit:${ip}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, WINDOW_SEC);
  }

  if (current > RATE_LIMIT) {
    const ttl = await redis.ttl(key);
    return { allowed: false, retryAfter: ttl };
  }

  return { allowed: true };
}


