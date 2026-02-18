/**
 * Per-IP rate limiting backed by Supabase.
 * Stores hashed IPs and request windows in the rate_limits table.
 * Fails closed in production if checks break.
 */
import { createHash } from 'crypto';
import { getSupabaseClient } from '@/lib/supabase';

const isDev = process.env.NODE_ENV !== 'production';
const MAX_REQUESTS = isDev ? 50 : 60;
const WINDOW_SECONDS = isDev ? 600 : 3600; // 10 min in dev, 1 hour in production

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetInSeconds: number;
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

/** Check and update rate limit state for a given IP (hashed). */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  try {
    const supabase = getSupabaseClient();
    const ipHash = hashIp(ip);
    const now = new Date();
    const windowCutoff = new Date(now.getTime() - WINDOW_SECONDS * 1000);

    // Clean up expired entries (keeps the table small)
    await supabase
      .from('rate_limits')
      .delete()
      .lt('window_start', windowCutoff.toISOString());

    // Get current rate limit entry for this IP
    const { data } = await supabase
      .from('rate_limits')
      .select('request_count, window_start')
      .eq('ip_hash', ipHash)
      .single();

    // No entry or window expired — start fresh
    if (!data || new Date(data.window_start) < windowCutoff) {
      await supabase
        .from('rate_limits')
        .upsert({
          ip_hash: ipHash,
          request_count: 1,
          window_start: now.toISOString(),
        });

      return {
        limited: false,
        remaining: MAX_REQUESTS - 1,
        resetInSeconds: WINDOW_SECONDS,
      };
    }

    // Over limit
    if (data.request_count >= MAX_REQUESTS) {
      const resetIn = Math.ceil(
        (new Date(data.window_start).getTime() + WINDOW_SECONDS * 1000 - now.getTime()) / 1000
      );
      return {
        limited: true,
        remaining: 0,
        resetInSeconds: Math.max(1, resetIn),
      };
    }

    // Under limit — increment
    await supabase
      .from('rate_limits')
      .update({ request_count: data.request_count + 1 })
      .eq('ip_hash', ipHash);

    const resetIn = Math.ceil(
      (new Date(data.window_start).getTime() + WINDOW_SECONDS * 1000 - now.getTime()) / 1000
    );

    return {
      limited: false,
      remaining: Math.max(0, MAX_REQUESTS - data.request_count - 1),
      resetInSeconds: Math.max(1, resetIn),
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    if (isDev) {
      return { limited: false, remaining: MAX_REQUESTS, resetInSeconds: WINDOW_SECONDS };
    }
    // Fail CLOSED in production
    return { limited: true, remaining: 0, resetInSeconds: 60 };
  }
}

/** Build standard rate limit headers for responses. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(MAX_REQUESTS),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + result.resetInSeconds),
    ...(result.limited ? { 'Retry-After': String(result.resetInSeconds) } : {}),
  };
}
