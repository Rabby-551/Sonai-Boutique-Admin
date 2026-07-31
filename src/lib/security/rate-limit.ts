export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  now?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

interface Counter {
  count: number;
  resetsAt: number;
}

const counters = new Map<string, Counter>();

/**
 * Applies a process-local fixed-window limit.
 * API-TODO: production must replace this with an edge or shared-store limiter.
 */
export function checkRateLimit(
  key: string,
  { limit, windowMs, now = Date.now() }: RateLimitOptions,
): RateLimitResult {
  const current = counters.get(key);
  const counter =
    !current || current.resetsAt <= now
      ? { count: 0, resetsAt: now + windowMs }
      : current;
  counter.count += 1;
  counters.set(key, counter);
  return {
    allowed: counter.count <= limit,
    limit,
    remaining: Math.max(0, limit - counter.count),
    retryAfterSeconds: Math.max(1, Math.ceil((counter.resetsAt - now) / 1000)),
  };
}

/** Builds a privacy-preserving limiter key from trusted proxy metadata when present. */
export function requestRateLimitKey(request: Request, scope: string): string {
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  return `${scope}:${address}`;
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "ratelimit-limit": String(result.limit),
    "ratelimit-remaining": String(result.remaining),
    "retry-after": String(result.retryAfterSeconds),
  };
}

/** Test-only reset for deterministic unit coverage. */
export function resetRateLimits(): void {
  counters.clear();
}
