import { type User } from "better-auth"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { env } from "@/env"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isUserAdmin(user?: User) {
  const adminEmail = env.ADMIN_EMAIL
  return user?.email?.toLowerCase() === adminEmail?.toLowerCase()
}

export function formatConfigName(name: string): string {
  if (name.startsWith("dev:") || name.startsWith("prod:")) {
    return name
  }
  const suffix = "'s Config"
  const baseName = name.endsWith(suffix) ? name : `${name}${suffix}`
  return env.NODE_ENV === "production" ? `prod:${baseName}` : `dev:${baseName}`
}

export function parseConfigName(name: string): string {
  return name.replace("dev:", "").replace("prod:", "")
}
