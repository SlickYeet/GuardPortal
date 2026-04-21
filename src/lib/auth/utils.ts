"use server"

import { headers } from "next/headers"

import { auth } from "@/server/auth"

export async function getSession() {
  "use cache"
  return auth.api.getSession({
    headers: await headers(),
  })
}
