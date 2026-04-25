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
import { useIsMobile } from "@/hooks/use-mobile"
import { api } from "@/lib/api/client"
import type { Session } from "@/lib/auth/utils"
import { cn } from "@/lib/utils"
import { ConfigDetailsSection } from "@/modules/dashboard/sections/config-details"
import { DashboardHeaderSection } from "@/modules/dashboard/sections/dashboard-header"
import { QRCodeSection } from "@/modules/dashboard/sections/qr-code-sections"
import { SetupInstructionsSection } from "@/modules/dashboard/sections/setup-instructions"

export function DashboardView({ session }: { session: Session }) {
  const isMobile = useIsMobile()
  const isAdmin = isUserAdmin(session)

  const [peerConfig] = api.wireguard.getPeerConfigByUserId.useSuspenseQuery({
    userId: session.user.id,
  })

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <DashboardHeaderSection isAdmin={isAdmin} session={session} />
        <div className="relative">
          <div
            className={cn(
              "grid gap-6 md:grid-cols-2",
              !peerConfig && "pointer-events-none blur-sm",
            )}
          >
            <QRCodeSection peerConfig={peerConfig} />
            <ConfigDetailsSection isAdmin={isAdmin} peerConfig={peerConfig} />
          </div>
          {!peerConfig && (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-lg bg-black/10"
              />
              <div
                className={cn(
                  "absolute left-1/2 w-full max-w-2xl -translate-x-1/2",
                  "md:top-1/2 md:-translate-y-1/2",
                  "top-1/5 -translate-y-1/5",
                )}
              >
                <Alert variant="destructive">
                  <AlertTriangleIcon />
                  <AlertTitle>Peer Configuration Not Found</AlertTitle>
                  <AlertDescription>
                    We couldn&apos;t find the WireGuard configuration for your
                    account. Please contact support if you believe this is an
                    error.
                  </AlertDescription>
                  <AlertAction>
                    <Button
                      nativeButton={false}
                      render={<Link href={isAdmin ? "/admin" : DISCORD_URL} />}
                      size={isMobile ? "icon" : "sm"}
                      variant="outline"
                    >
                      {!isMobile &&
                        (isAdmin ? "Go to Admin Panel" : "Get Help")}
                      <ArrowUpRight className="size-4" />
                    </Button>
                  </AlertAction>
                </Alert>
              </div>
            </>
          )}
        </div>
        <SetupInstructionsSection />
      </div>
    </div>
  )
}
