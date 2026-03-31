import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedisClient(): Redis | null {
  if (redis) return redis;
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    return null;
  }
  
  redis = new Redis({ url, token });
  return redis;
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "unknown";
}

interface RateLimitState {
  count: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, RateLimitState>();
const MAX_BUCKETS_SIZE = 10000;
let lastCleanup = Date.now();

function memoryCleanup(now: number): void {
  if (now - lastCleanup < 60000 && memoryBuckets.size < MAX_BUCKETS_SIZE) {
    return;
  }
  
  lastCleanup = now;
  const keysToDelete: string[] = [];
  
  for (const [key, state] of memoryBuckets.entries()) {
    if (state.resetAt <= now) {
      keysToDelete.push(key);
    }
    if (keysToDelete.length >= 1000) break;
  }
  
  for (const key of keysToDelete) {
    memoryBuckets.delete(key);
  }
  
  if (memoryBuckets.size > MAX_BUCKETS_SIZE) {
    const sorted = Array.from(memoryBuckets.entries())
      .sort((a, b) => a[1].resetAt - b[1].resetAt)
      .slice(0, memoryBuckets.size - MAX_BUCKETS_SIZE);
    for (const [key] of sorted) {
      memoryBuckets.delete(key);
    }
  }
}

function consumeMemoryRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  memoryCleanup(now);

  const state = memoryBuckets.get(key);
  if (!state || state.resetAt <= now) {
    const nextState = { count: 1, resetAt: now + windowMs };
    memoryBuckets.set(key, nextState);
    return { allowed: true, remaining: limit - 1, resetAt: nextState.resetAt };
  }

  state.count += 1;
  const allowed = state.count <= limit;
  memoryBuckets.set(key, state);

  return {
    allowed,
    remaining: Math.max(0, limit - state.count),
    resetAt: state.resetAt
  };
}

async function consumeRedisRateLimit(
  key: string, 
  limit: number, 
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const client = getRedisClient();
  if (!client) {
    return consumeMemoryRateLimit(key, limit, windowMs);
  }

  const now = Date.now();
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;
  
  try {
    const current = await client.incr(windowKey);
    if (current === 1) {
      await client.expire(windowKey, Math.ceil(windowMs / 1000));
    }
    
    const allowed = current <= limit;
    const resetAt = Math.floor(now / windowMs) * windowMs + windowMs;
    
    return {
      allowed,
      remaining: Math.max(0, limit - current),
      resetAt
    };
  } catch {
    return consumeMemoryRateLimit(key, limit, windowMs);
  }
}

export async function consumeRateLimit(
  key: string, 
  limit: number, 
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  return consumeRedisRateLimit(key, limit, windowMs);
}

export function consumeRateLimitSync(
  key: string, 
  limit: number, 
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  return consumeMemoryRateLimit(key, limit, windowMs);
}
