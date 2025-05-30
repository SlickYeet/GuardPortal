"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { SignInSchema } from "@/schemas/auth"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export async function signIn(values: z.infer<typeof SignInSchema>) {
  const { email, password, rememberMe } = values

  if (!email || !password) {
    return {
      success: false,
      message: "Email and password are required.",
    }
  }

  const user = await db.user.count({
    where: { email },
  })

  if (user === 0) {
    return {
      success: false,
      message: "User not found. Please sign up first.",
    }
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
      success: false,
      message: `Sign in failed: ${errorJson.message}`,
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
