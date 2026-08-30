type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit = Number(process.env.RATE_LIMIT_PER_MINUTE || 30), windowMs = 60_000) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfter: 0 };
  }
  if (current.count >= limit) return { allowed: false, remaining: 0, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  current.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - current.count), retryAfter: 0 };
}