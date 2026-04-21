import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_CONTACT_EMAIL: z.email(),
    NEXT_PUBLIC_URL: z.url(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_NAME: process.env.ADMIN_NAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NODE_ENV: process.env.NODE_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    WIREGUARD_API_ENDPOINT: process.env.WIREGUARD_API_ENDPOINT,
    WIREGUARD_API_KEY: process.env.WIREGUARD_API_KEY,
    WIREGUARD_VPN_ENDPOINT: process.env.WIREGUARD_VPN_ENDPOINT,
    WIREGUARD_VPN_PORT: process.env.WIREGUARD_VPN_PORT,
  },
  server: {
    ADMIN_EMAIL: z.string(),
    ADMIN_NAME: z.string(),
    ADMIN_PASSWORD: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    DATABASE_URL: z.url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    RESEND_API_KEY: z.string(),
    WIREGUARD_API_ENDPOINT: z.string(),
    WIREGUARD_API_KEY: z.string(),
    WIREGUARD_VPN_ENDPOINT: z.string(),
    WIREGUARD_VPN_PORT: z.string(),
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
