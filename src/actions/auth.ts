"use server"

import { z } from "zod"

import { env } from "@/env"
import { SignInSchema } from "@/schemas/auth"
import { auth } from "@/server/auth"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function signIn(values: z.infer<typeof SignInSchema>) {
  const session = await auth.api.getSession({
    headers: new Headers(),
  })
  if (session) {
    return {
      success: true,
      message: "Already signed in.",
      session,
    }
  }

  const { email, password } = values

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
