"use server"

import { env } from "@/env"
import { auth } from "@/server/auth"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function signIn(_prevState: any, formdata: FormData) {
  const email = formdata.get("email") as string
  const password = formdata.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const res = await auth.api.signInEmail({
    body: {
      email,
      password,
      callbackURL: `${env.NEXT_PUBLIC_URL}/vpn`,
    },
    asResponse: true,
  })

  if (!res.ok) {
    const errorJson = await res.json()
    return {
      error: `Sign in failed: ${errorJson.message}`,
    }
  }

  const session = await auth.api.getSession({
    headers: new Headers(),
    asResponse: true,
  })

  if (!session.ok) {
    return {
      error: "Failed to retrieve session after sign in.",
    }
  }

  return {
    success: true,
    message: "Successfully signed in.",
    session,
  }
}

export async function signOut() {
  const session = await auth.api.getSession({
    headers: new Headers(),
  })
  if (!session) {
    return { error: "No active session found." }
  }

  const res = await auth.api.signOut({
    headers: new Headers(),
    asResponse: true,
  })

  if (!res.ok) {
    return { error: "Failed to sign out." }
  }

  return { success: true, message: "Successfully signed out." }
}
