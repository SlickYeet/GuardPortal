import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreatePeerConfigModal } from "@/modules/admin/ui/create-peer-config-modal"
import { PeerConfigTable } from "@/modules/admin/ui/peer-config-table"

export function PeerConfigsView() {
  return (
    <Card>
      <CardHeader className="flex items-start justify-between">
        <div className="flex flex-col gap-y-1">
          <CardTitle>Peer Configs</CardTitle>
          <CardDescription>
            View and manage WireGuard peer configs.
          </CardDescription>
        </div>
        <CreatePeerConfigModal />
      </CardHeader>
      <CardContent>
        <PeerConfigTable />
      </CardContent>
    </Card>
  )
}
