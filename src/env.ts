import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),
    WIREGUARD_API_ENDPOINT: z.url(),
    WIREGUARD_API_KEY: z.string(),
    WIREGUARD_VPN_ENDPOINT: z.string(),
    WIREGUARD_VPN_PORT: z.string(),
    RESEND_API_KEY: z.string(),
    REDIS_URL: z.string(),
    ADMIN_NAME: z.string(),
    ADMIN_EMAIL: z.email(),
    ADMIN_PASSWORD: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
  },

  client: {
    NEXT_PUBLIC_URL: z.url(),
    NEXT_PUBLIC_CONTACT_EMAIL: z.email(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    WIREGUARD_API_ENDPOINT: process.env.WIREGUARD_API_ENDPOINT,
    WIREGUARD_API_KEY: process.env.WIREGUARD_API_KEY,
    WIREGUARD_VPN_ENDPOINT: process.env.WIREGUARD_VPN_ENDPOINT,
    WIREGUARD_VPN_PORT: process.env.WIREGUARD_VPN_PORT,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    REDIS_URL: process.env.REDIS_URL,
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    ADMIN_NAME: process.env.ADMIN_NAME,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
