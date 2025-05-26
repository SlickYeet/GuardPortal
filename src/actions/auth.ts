"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { env } from "@/env"
import { SignInSchema } from "@/schemas/auth"
import { auth } from "@/server/auth"

export async function createFirstUserAsAdmin() {
  const name = env.ADMIN_NAME
  const email = env.ADMIN_EMAIL
  const password = env.ADMIN_PASSWORD

  const res = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
    asResponse: true,
  })

  if (!res.ok) {
    const errorJson = await res.json()
    return {
      error: `Sign up failed: ${errorJson.message}`,
    }
  }

  return redirect("/vpn")
}

export async function signIn(values: z.infer<typeof SignInSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    return {
      success: true,
      message: "Already signed in.",
      session,
    }
  }

  const { email, password, rememberMe } = values

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const res = await auth.api.signInEmail({
    body: {
      email,
      password,
      rememberMe,
    },
    asResponse: true,
  })

  if (!res.ok) {
    const errorJson = await res.json()
    return {
      error: `Sign in failed: ${errorJson.message}`,
    }
  }

  return redirect("/vpn")
}

export async function signOut() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "No active session found." }
  }

  const res = await auth.api.signOut({
    headers: await headers(),
    asResponse: true,
  })

  if (!res.ok) {
    return { error: "Failed to sign out." }
  }

  return redirect("/")
}
