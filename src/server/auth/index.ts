import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { betterAuth } from "better-auth/minimal"
import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins/admin"

import { env } from "@/env"
import { db } from "@/server/db"

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [admin(), nextCookies()],
})
