"use client"

import { XIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"
import { api } from "@/lib/api/client"
import { CreatePeerConfigModal } from "@/modules/admin/ui/create-peer-config-modal"
import { PeerConfigTable } from "@/modules/admin/ui/peer-config-table"

export function PeerConfigsView() {
  const isMobile = useIsMobile()
  const searchParams = useSearchParams()
  const peerId = searchParams.get("peerId") ?? undefined

  return (
    <div className="flex flex-col justify-center pb-12">
      <Card>
        <CardHeader className="flex items-start justify-between">
          <div className="flex flex-col gap-y-1">
            <CardTitle>Peer Configs</CardTitle>
            <CardDescription>
              View and manage WireGuard peer configs.
            </CardDescription>
          </div>
          <div className="flex items-center gap-x-2">
            {!isMobile && peerId && <ClearPeerIdButton />}
            <CreatePeerConfigModal />
          </div>
        </CardHeader>
        <CardContent>
          <PeerConfigTable />
        </CardContent>
      </Card>
      {isMobile && peerId && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
          <ClearPeerIdButton />
        </div>
      )}
    </div>
  )
}

function ClearPeerIdButton() {
  const router = useRouter()
  const utils = api.useUtils()
  const isMobile = useIsMobile()

  function clearPeerId() {
    router.push("/admin/configs")
    utils.admin.peerConfigs.list.invalidate()
  }

  return (
    <Button
      onClick={clearPeerId}
      size={isMobile ? "sm" : "default"}
      variant={isMobile ? "secondary" : "ghost"}
    >
      <XIcon /> Clear Filter
    </Button>
  )
}
