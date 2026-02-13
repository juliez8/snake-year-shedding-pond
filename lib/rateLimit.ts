import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const MAX_REQUESTS = 3;
const WINDOW_HOURS = 1;

/**
 * Check if IP address has exceeded rate limit
 * Returns true if rate limit exceeded, false if allowed
 */
export async function isRateLimited(ip: string): Promise<boolean> {
  const key = `ratelimit:${ip}`;
  
  try {
    const current = await redis.get<number>(key);
    
    if (current === null) {
      // First request from this IP
      await redis.set(key, 1, { ex: WINDOW_HOURS * 3600 });
      return false;
    }
    
    if (current >= MAX_REQUESTS) {
      return true;
    }
    
    // Increment counter
    await redis.incr(key);
    return false;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if Redis is down
    return false;
  }
}

/**
 * Get remaining requests for an IP
 */
export async function getRemainingRequests(ip: string): Promise<number> {
  const key = `ratelimit:${ip}`;
  
  try {
    const current = await redis.get<number>(key);
    if (current === null) return MAX_REQUESTS;
    return Math.max(0, MAX_REQUESTS - current);
  } catch (error) {
    console.error('Get remaining requests failed:', error);
    return MAX_REQUESTS;
  }
}
