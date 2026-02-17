import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('Redis configuration missing');
    }

    redis = new Redis({ url, token });
  }
  return redis;
}

const isDev = process.env.NODE_ENV !== 'production';
const MAX_REQUESTS = isDev ? 50 : 60;
const WINDOW_SECONDS = isDev ? 600 : 3600; // 10 min in dev, 1 hour in production

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Atomic rate limiting using Redis INCR + EXPIRE.
 * Uses a single INCR which is atomic — no race condition between check and increment.
 * Fails CLOSED: if Redis is unreachable, requests are denied (safe default for production).
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const key = `ratelimit:${ip}`;

  try {
    const client = getRedis();

    // INCR is atomic — if key doesn't exist, it creates it with value 1
    const current = await client.incr(key);

    // If this is the first request (INCR created the key), set the TTL
    if (current === 1) {
      await client.expire(key, WINDOW_SECONDS);
    }

    // Get TTL for reset time
    const ttl = await client.ttl(key);
    const resetInSeconds = ttl > 0 ? ttl : WINDOW_SECONDS;

    if (current > MAX_REQUESTS) {
      return {
        limited: true,
        remaining: 0,
        resetInSeconds,
      };
    }

    return {
      limited: false,
      remaining: Math.max(0, MAX_REQUESTS - current),
      resetInSeconds,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    if (isDev) {
      // Fail OPEN in development so you can test freely
      return { limited: false, remaining: MAX_REQUESTS, resetInSeconds: WINDOW_SECONDS };
    }
    // Fail CLOSED in production — deny request if Redis is unavailable
    return { limited: true, remaining: 0, resetInSeconds: 60 };
  }
}

/**
 * Build standard rate limit headers for the response.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(MAX_REQUESTS),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + result.resetInSeconds),
    ...(result.limited ? { 'Retry-After': String(result.resetInSeconds) } : {}),
  };
}
