"use client"

import { AlertTriangleIcon, ArrowUpRight } from "lucide-react"
import Link from "next/link"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { DISCORD_URL } from "@/constants"
import { isUserAdmin } from "@/helpers/is-user-admin"
import { api } from "@/lib/api/client"
import type { Session } from "@/lib/auth/utils"
import { ConfigDetailsSection } from "@/modules/dashboard/sections/config-details"
import { DashboardHeaderSection } from "@/modules/dashboard/sections/dashboard-header"
import { QRCodeSection } from "@/modules/dashboard/sections/qr-code-sections"
import { SetupInstructionsSection } from "@/modules/dashboard/sections/setup-instructions"

export function DashboardView({ session }: { session: Session }) {
  const isAdmin = isUserAdmin(session)

  const { data: peerConfig } = api.wireguard.getPeerConfigByUserId.useQuery({
    userId: session.user.id,
  })

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <DashboardHeaderSection isAdmin={isAdmin} session={session} />
        {peerConfig ? (
          <div className="grid gap-6 md:grid-cols-2">
            <QRCodeSection peerConfig={peerConfig} />
            <ConfigDetailsSection isAdmin={isAdmin} peerConfig={peerConfig} />
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertTriangleIcon />
            <AlertTitle>Peer Configuration Not Found</AlertTitle>
            <AlertDescription>
              We couldn&apos;t find the WireGuard configuration for your
              account. Please contact support if you believe this is an error.
            </AlertDescription>
            <AlertAction>
              <Button
                nativeButton={false}
                render={<Link href={DISCORD_URL} />}
                variant="outline"
              >
                Get Help <ArrowUpRight className="size-3.5" />
              </Button>
            </AlertAction>
          </Alert>
        )}
        <SetupInstructionsSection />
      </div>
    </div>
  )
}
