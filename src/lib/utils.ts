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
