import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { betterAuth } from "better-auth/minimal"
import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins/admin"
import { genericOAuth } from "better-auth/plugins/generic-oauth"

import { APP_NAME } from "@/constants"
import { env } from "@/env"
import { getRedisClient } from "@/lib/redis"
import { db } from "@/server/db"
import { user as userTable } from "@/server/db/schema"

export const auth = betterAuth({
  account: {
    encryptOAuthTokens: true,
  },
  appName: APP_NAME,
  baseURL: env.NEXT_PUBLIC_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  databaseHooks: {
    user: {
      create: {
        async after() {
          const users = await db.$count(userTable)
          if (users === 1) {
            await db.update(userTable).set({
              emailVerified: true,
              role: "admin",
            })
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    admin(),
    genericOAuth({
      config: [
        {
          clientId: env.AUTHENTIK_CLIENT_ID,
          clientSecret: env.AUTHENTIK_CLIENT_SECRET,
          discoveryUrl:
            "https://auth.famlam.ca/application/o/wire-guard/.well-known/openid-configuration",
          pkce: true,
          providerId: "authentik",
          scopes: ["openid", "email", "profile"],
        },
      ],
    }),
    nextCookies(),
  ],
  rateLimit: {
    storage: "secondary-storage",
  },
  secondaryStorage: {
    async delete(key) {
      const redis = getRedisClient()
      await redis.del(key)
    },
    async get(key) {
      const redis = getRedisClient()
      return await redis.get(key)
    },
    async set(key, value, ttl) {
      const redis = getRedisClient()
      if (ttl)
        await redis.set(key, value, {
          expiration: {
            type: "EX",
            value: ttl,
          },
        })
      else await redis.set(key, value)
    },
  },
  secret: env.BETTER_AUTH_SECRET,
})
