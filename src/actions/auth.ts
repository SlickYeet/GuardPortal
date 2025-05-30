"use server"

import { compare } from "bcryptjs"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { env } from "@/env"
import { SignInSchema, SignUpSchema } from "@/schemas/auth"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export async function createFirstUserAsAdmin(
  values: z.infer<typeof SignUpSchema>,
) {
  const name = values.name || env.ADMIN_NAME
  const email = values.email || env.ADMIN_EMAIL
  const password = values.password || env.ADMIN_PASSWORD

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

  await db.user.update({
    where: { email },
    data: {
      emailVerified: true,
      isFirstLogin: false,
      role: "admin",
    },
  })

  return redirect("/vpn")
}

export async function signIn(values: z.infer<typeof SignInSchema>) {
  const { email, password, rememberMe } = values

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

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

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      accounts: {
        select: {
          id: true,
          password: true,
          providerId: true,
        },
      },
    },
  })

  if (!user) {
    return { error: "No user with that email found." }
  }

  const account = user.accounts.find((acc) => acc.providerId === "credential")
  if (!account || !account.password) {
    return { error: "Invalid credentials." }
  }

  const isPasswordValid = await compare(password, account.password)
  if (!isPasswordValid) {
    return { error: "Password is incorrect." }
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

export async function isUserFirstLogin(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isFirstLogin: true },
  })

  return user?.isFirstLogin ?? false
}
