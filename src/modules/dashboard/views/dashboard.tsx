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
import { env } from "@/env"
import { isUserAdmin } from "@/helpers/is-user-admin"
import { useIsMobile } from "@/hooks/use-mobile"
import { api } from "@/lib/api/client"
import type { Session } from "@/lib/auth/utils"
import { cn } from "@/lib/utils"
import { ConfigDetailsSection } from "@/modules/dashboard/sections/config-details"
import { DashboardHeaderSection } from "@/modules/dashboard/sections/dashboard-header"
import { QRCodeSection } from "@/modules/dashboard/sections/qr-code-sections"
import { SetupInstructionsSection } from "@/modules/dashboard/sections/setup-instructions"
import { QRCodeModal } from "@/modules/dashboard/ui/qr-code-modal"

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
            <div className="hidden md:block">
              <QRCodeSection peerConfig={peerConfig} />
            </div>
            <div className="block md:hidden">
              <QRCodeModal peerConfig={peerConfig} />
            </div>
            <ConfigDetailsSection isAdmin={isAdmin} peerConfig={peerConfig} />
          </div>
          {!peerConfig && (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-lg bg-black/10"
              />
              <div className="absolute top-1/2 left-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2">
                <div className="rounded-2xl bg-card">
                  <Alert variant="destructive">
                    <AlertTriangleIcon />
                    <AlertTitle>Peer Configuration Not Found</AlertTitle>
                    <AlertDescription>
                      We couldn&apos;t find the WireGuard configuration for your
                      account. Please contact{" "}
                      <Link href={`mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`}>
                        {env.NEXT_PUBLIC_CONTACT_EMAIL}
                      </Link>{" "}
                      if you believe this is an error.
                    </AlertDescription>
                    <AlertAction>
                      <Button
                        nativeButton={false}
                        render={
                          <Link
                            href={isAdmin ? "/admin/configs" : DISCORD_URL}
                          />
                        }
                        size={isMobile ? "icon" : "sm"}
                        variant="secondary"
                      >
                        {!isMobile &&
                          (isAdmin ? "Go to Admin Panel" : "Get Help")}
                        <ArrowUpRight className="size-4" />
                      </Button>
                    </AlertAction>
                  </Alert>
                </div>
              </div>
            </>
          )}
        </div>
        <SetupInstructionsSection />
      </div>
    </div>
  )
}
