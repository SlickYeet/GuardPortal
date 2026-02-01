import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins"

import { env } from "@/env"
import { db } from "@/server/db"

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: env.NEXT_PUBLIC_URL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: false,
      },
      isFirstLogin: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
      },
    },
  },

  plugins: [admin(), nextCookies()], // make sure nextCookies() is the last plugin in the array
})
