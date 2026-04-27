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
import { api } from "@/lib/api/client"
import { CreatePeerConfigModal } from "@/modules/admin/ui/create-peer-config-modal"
import { PeerConfigTable } from "@/modules/admin/ui/peer-config-table"

export function PeerConfigsView() {
  const searchParams = useSearchParams()
  const peerId = searchParams.get("peerId") ?? undefined

  return (
    <Card>
      <CardHeader className="flex items-start justify-between">
        <div className="flex flex-col gap-y-1">
          <CardTitle>Peer Configs</CardTitle>
          <CardDescription>
            View and manage WireGuard peer configs.
          </CardDescription>
        </div>
        <div className="flex items-center gap-x-2">
          {peerId && <ClearPeerIdButton />}
          <CreatePeerConfigModal />
        </div>
      </CardHeader>
      <CardContent>
        <PeerConfigTable />
      </CardContent>
    </Card>
  )
}

function ClearPeerIdButton() {
  const router = useRouter()
  const utils = api.useUtils()

  function clearPeerId() {
    router.push("/admin/configs")
    utils.admin.peerConfigs.list.invalidate()
  }

  return (
    <Button onClick={clearPeerId} variant="ghost">
      <XIcon /> Clear Peer ID
    </Button>
  )
}
