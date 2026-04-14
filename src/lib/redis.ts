import Redis from "ioredis"

import { env } from "@/env"

export function getRedis() {
  return new Redis(env.REDIS_URL);
}