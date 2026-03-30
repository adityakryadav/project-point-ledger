const { TokenBucket } = require("limiter");

/**
 * Token-bucket rate limiter to thwart automated botnet exploitation.
 *
 * ILPEP execution plan notes:
 * - API Gateway Layer includes "rate limiting" and "botnet" hardening.
 * - This middleware uses a per-client token bucket with burst + sustained refill.
 *
 * Defaults are conservative and can be tuned via environment variables.
 */

const buckets = new Map(); // key -> { bucket: TokenBucket, lastSeenMs: number }
let lastPruneMs = Date.now();

function toInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getClientKey(req) {
  // Use Express' best-effort client IP resolution. If behind a proxy, the app
  // should be configured with `app.set('trust proxy', ...)` so req.ip is correct.
  const ip = req.ip || req.connection?.remoteAddress || "unknown-ip";
  // Separate buckets per path reduces cross-endpoint impact.
  const path = req.route?.path || req.path || "/";
  return `${ip}:${path}`;
}

function parseInterval(intervalStr) {
  // limiter TokenBucket accepts: sec/second, min/minute, hr/hour, day, or ms.
  // We keep this narrow to avoid accidental misconfiguration.
  const s = String(intervalStr || "").trim().toLowerCase();
  if (!s) return { interval: "minute", intervalMs: 60_000 };
  if (s === "second" || s === "sec") return { interval: "second", intervalMs: 1_000 };
  if (s === "minute" || s === "min") return { interval: "minute", intervalMs: 60_000 };
  if (s === "hour" || s === "hr") return { interval: "hour", intervalMs: 3_600_000 };
  if (s === "day") return { interval: "day", intervalMs: 86_400_000 };
  // If it's a number, treat as milliseconds.
  const ms = Number(s);
  if (Number.isFinite(ms) && ms > 0) return { interval: ms, intervalMs: ms };
  return { interval: "minute", intervalMs: 60_000 };
}

function computeRetryAfterSeconds({ bucket, tokensPerRequest }) {
  // TokenBucket stores:
  // - `interval` (ms)
  // - `tokensPerInterval`
  // - `content` (current tokens after `drip()` during tryRemoveTokens)
  //
  // tryRemoveTokens fails when `tokensPerRequest > bucket.content`.
  // Compute how long it takes to drip enough tokens to reach tokensPerRequest.
  if (!bucket || !bucket.tokensPerInterval || bucket.tokensPerInterval <= 0) {
    return 1;
  }

  const neededTokens = Math.max(tokensPerRequest - bucket.content, 0);
  if (neededTokens <= 0) return 1;

  const intervalMs = bucket.interval;
  const dripMsForOneToken = intervalMs / bucket.tokensPerInterval;
  const retryMs = Math.ceil(neededTokens * dripMsForOneToken);
  return Math.max(1, Math.ceil(retryMs / 1000));
}

function pruneBucketsIfNeeded(maxBuckets, maxIdleMs) {
  if (buckets.size <= maxBuckets) return;

  const nowMs = Date.now();
  for (const [key, entry] of buckets.entries()) {
    if (nowMs - entry.lastSeenMs > maxIdleMs) buckets.delete(key);
  }

  // If still too large, do a second pass (hard cap).
  if (buckets.size > maxBuckets) {
    const entries = Array.from(buckets.entries()).sort(
      (a, b) => a[1].lastSeenMs - b[1].lastSeenMs
    );
    const toRemove = buckets.size - maxBuckets;
    for (let i = 0; i < toRemove; i++) {
      buckets.delete(entries[i][0]);
    }
  }
}

/**
 * Middleware factory.
 *
 * Environment variables:
 * - RATE_LIMIT_INTERVAL: "second" | "minute" | "hour" | "day" | "<ms>" (default "minute")
 * - RATE_LIMIT_BUCKET_SIZE: burst capacity (default 120)
 * - RATE_LIMIT_TOKENS_PER_INTERVAL: sustained refill rate (default 60)
 * - RATE_LIMIT_TOKENS_PER_REQUEST: tokens consumed per request (default 1)
 * - RATE_LIMIT_MAX_BUCKETS: max number of per-client buckets (default 5000)
 * - RATE_LIMIT_MAX_IDLE_MS: prune buckets idle time (default 15 min)
 * - RATE_LIMIT_EXCLUDE_HEALTH: "true" to exclude GET /health from limiting (default "true")
 */
function rateLimiter(req, res, next) {
  if (req.method === "OPTIONS") return next();

  const excludeHealth = String(process.env.RATE_LIMIT_EXCLUDE_HEALTH ?? "true") === "true";
  if (excludeHealth && req.path === "/health") return next();

  const intervalInfo = parseInterval(process.env.RATE_LIMIT_INTERVAL);
  const bucketSize = Math.max(
    1,
    toInt(process.env.RATE_LIMIT_BUCKET_SIZE, 120)
  );
  const tokensPerInterval = Math.max(
    1,
    toNumber(process.env.RATE_LIMIT_TOKENS_PER_INTERVAL, 60)
  );
  const tokensPerRequest = Math.max(1, toInt(process.env.RATE_LIMIT_TOKENS_PER_REQUEST, 1));

  const maxBuckets = Math.max(100, toInt(process.env.RATE_LIMIT_MAX_BUCKETS, 5000));
  const maxIdleMs = Math.max(
    1_000,
    toInt(process.env.RATE_LIMIT_MAX_IDLE_MS, 15 * 60 * 1000)
  );

  // Prune periodically to keep memory bounded.
  const nowMs = Date.now();
  if (nowMs - lastPruneMs > 30_000) {
    pruneBucketsIfNeeded(maxBuckets, maxIdleMs);
    lastPruneMs = nowMs;
  }

  const key = getClientKey(req);
  const existing = buckets.get(key);

  if (!existing) {
    buckets.set(key, {
      bucket: new TokenBucket({
        bucketSize,
        tokensPerInterval,
        interval: intervalInfo.interval,
      }),
      lastSeenMs: nowMs,
    });
  } else {
    existing.lastSeenMs = nowMs;
  }

  const entry = buckets.get(key);
  const allowed = entry.bucket.tryRemoveTokens(tokensPerRequest);

  // Immediate 429 on excess requests, without waiting.
  if (!allowed) {
    const retryAfterSeconds = computeRetryAfterSeconds({
      bucket: entry.bucket,
      tokensPerRequest,
    });
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({
      error: "rate_limit_exceeded",
      message: "Too many requests. Please slow down.",
      retry_after_seconds: retryAfterSeconds,
    });
  }

  return next();
}

module.exports = { rateLimiter };

