import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_CONTACT_EMAIL: z.email(),
    NEXT_PUBLIC_DISCORD_URL: z.url(),
    NEXT_PUBLIC_URL: z.url(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    AUTHENTIK_CLIENT_ID: process.env.AUTHENTIK_CLIENT_ID,
    AUTHENTIK_CLIENT_SECRET: process.env.AUTHENTIK_CLIENT_SECRET,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    NEXT_PUBLIC_DISCORD_URL: process.env.NEXT_PUBLIC_DISCORD_URL,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NODE_ENV: process.env.NODE_ENV,
    REDIS_URL: process.env.REDIS_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    WIREGUARD_API_ENDPOINT: process.env.WIREGUARD_API_ENDPOINT,
    WIREGUARD_API_KEY: process.env.WIREGUARD_API_KEY,
    WIREGUARD_CONFIG_NAME: process.env.WIREGUARD_CONFIG_NAME,
    WIREGUARD_VPN_ENDPOINT: process.env.WIREGUARD_VPN_ENDPOINT,
    WIREGUARD_VPN_PORT: process.env.WIREGUARD_VPN_PORT,
  },
  server: {
    AUTHENTIK_CLIENT_ID: z.string(),
    AUTHENTIK_CLIENT_SECRET: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    DATABASE_URL: z.url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    REDIS_URL: z.string(),
    RESEND_API_KEY: z.string(),
    WIREGUARD_API_ENDPOINT: z.string(),
    WIREGUARD_API_KEY: z.string(),
    WIREGUARD_CONFIG_NAME: z.string(),
    WIREGUARD_VPN_ENDPOINT: z.string(),
    WIREGUARD_VPN_PORT: z.string(),
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
