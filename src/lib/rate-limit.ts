import { db } from "@/lib/db";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function localRateLimit(key: string, limit: number, windowMs: number) {
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

export async function checkRateLimit(key: string, limit = Number(process.env.RATE_LIMIT_PER_MINUTE || 30), windowMs = 60_000) {
  const boundedLimit = Number.isInteger(limit) && limit > 0 ? limit : 30;
  const boundedWindow = Number.isInteger(windowMs) && windowMs > 0 ? windowMs : 60_000;
  try {
    const result = await db.query(`
      INSERT INTO rate_limit_buckets (key, window_started_at, count)
      VALUES ($1, NOW(), 1)
      ON CONFLICT (key) DO UPDATE SET
        window_started_at = CASE
          WHEN rate_limit_buckets.window_started_at <= NOW() - ($2 * INTERVAL '1 millisecond') THEN NOW()
          ELSE rate_limit_buckets.window_started_at
        END,
        count = CASE
          WHEN rate_limit_buckets.window_started_at <= NOW() - ($2 * INTERVAL '1 millisecond') THEN 1
          ELSE rate_limit_buckets.count + 1
        END
      RETURNING count, EXTRACT(EPOCH FROM (window_started_at + ($2 * INTERVAL '1 millisecond'))) * 1000 AS reset_at
    `, [key, boundedWindow]);
    const count = Number(result.rows[0]?.count || 0);
    const resetAt = Number(result.rows[0]?.reset_at || Date.now() + boundedWindow);
    if (count > boundedLimit) return { allowed: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)) };
    return { allowed: true, remaining: Math.max(0, boundedLimit - count), retryAfter: 0 };
  } catch {
    // Keep local development usable before the migration has been applied; production uses the shared table.
    return localRateLimit(key, boundedLimit, boundedWindow);
  }
}
