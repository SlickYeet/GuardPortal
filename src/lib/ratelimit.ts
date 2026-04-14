import { getRedis } from "@/lib/redis"

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

  const currentCount = await getRedis().get(key)
  const count = parseInt(currentCount as string, 10) || 0

  const ttl = await getRedis().ttl(key)

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
    await getRedis().set(key, 1, "PX", window)
  } else {
    await getRedis().incr(key)
  }

  // Updated TTL for next request
  const newTtl = await getRedis().ttl(key)
  const reset = Date.now() + (newTtl > 0 ? newTtl * 1000 : window)

  return {
    limit,
    remaining: limit - (count + 1),
    success: true,
    reset,
  }
}
