"use client"

import { UserMenu } from "@/components/user-menu"
import type { Session } from "@/lib/auth/utils"

interface DashboardHeaderSectionProps {
  isAdmin: boolean
  session: Session
}

export function DashboardHeaderSection({
  isAdmin,
  session,
}: DashboardHeaderSectionProps) {
  return (
    <div className="mb-8 flex justify-between gap-x-4">
      <div>
        <h1 className="font-bold text-3xl text-primary">
          Your VPN Configuration
        </h1>
        <p className="mt-2 text-muted-foreground">
          Scan the QR code or download the configuration file
        </p>
      </div>
      <UserMenu isAdmin={isAdmin} user={session.user} />
    </div>
  )
}
