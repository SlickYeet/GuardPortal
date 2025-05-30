import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { env } from "@/env"
import { auth } from "@/server/auth"

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_URL,
  plugins: [adminClient(), inferAdditionalFields<typeof auth>()],
})

export const { signIn, signOut, useSession } = authClient
