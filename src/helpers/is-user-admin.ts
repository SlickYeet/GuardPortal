import type { Session } from "@/lib/auth/utils"

export function isUserAdmin(session: Session | null): boolean {
  if (!session) return false
  return session.user.role === "admin"
}
