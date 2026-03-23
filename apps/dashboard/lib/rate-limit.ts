import type { NextRequest } from "next/server";

type RateLimitState = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitState>();

function cleanup(now: number) {
  for (const [key, state] of buckets.entries()) {
    if (state.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "unknown";
}

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  cleanup(now);

  const state = buckets.get(key);
  if (!state || state.resetAt <= now) {
    const nextState = { count: 1, resetAt: now + windowMs };
    buckets.set(key, nextState);
    return { allowed: true, remaining: limit - 1, resetAt: nextState.resetAt };
  }

  state.count += 1;
  const allowed = state.count <= limit;
  buckets.set(key, state);

  return {
    allowed,
    remaining: Math.max(0, limit - state.count),
    resetAt: state.resetAt
  };
}
