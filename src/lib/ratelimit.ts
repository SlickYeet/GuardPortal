import { redis } from "@/lib/redis"

type RateLimitResponse = {
  limit: number
  remaining: number
  success: boolean
}

interface RateLimiterOptions {
  ip: string
  limit?: number
  duration?: number
}

export async function rateLimiter({
  ip,
  limit = 3,
  duration = 60 * 1000, // 1 minute
}: RateLimiterOptions): Promise<RateLimitResponse> {
  const key = `ratelimit:${ip}`

  const currentCount = await redis.get(key)
  const count = parseInt(currentCount as string, 10) || 0

  if (count >= limit) {
    return {
      limit,
      remaining: limit - count,
      success: false,
    }
  }

  redis.incr(key)
  redis.expire(key, duration / 1000)

  return {
    limit,
    remaining: limit - (count + 1),
    success: true,
  }
}
