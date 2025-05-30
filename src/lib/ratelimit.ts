import { redis } from "@/lib/redis"

type RateLimitResponse = {
  limit: number
  remaining: number
  success: boolean
  reset?: number
}

interface RateLimiterOptions {
  ip: string
  limit?: number
  window?: number // in milliseconds
}

export async function rateLimiter({
  ip,
  limit = 3,
  window = 60 * 1000, // 1 minute
}: RateLimiterOptions): Promise<RateLimitResponse> {
  const key = `ratelimit:${ip}`

  const currentCount = await redis.get(key)
  const count = parseInt(currentCount as string, 10) || 0

  const ttl = await redis.ttl(key)

  if (count >= limit) {
    // Calculate reset time in ms from now
    const reset = Date.now() + (ttl > 0 ? ttl * 1000 : window)
    return {
      limit,
      remaining: 0,
      success: false,
      reset,
    }
  }

  // Set the expiry if first request
  if (count === 0) {
    await redis.set(key, 1, "PX", window)
  } else {
    await redis.incr(key)
  }

  // Updated TTL for next request
  const newTtl = await redis.ttl(key)
  const reset = Date.now() + (newTtl > 0 ? newTtl * 1000 : window)

  return {
    limit,
    remaining: limit - (count + 1),
    success: true,
    reset,
  }
}
