"use client"

import { useSearchParams } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { parsePeerConfigName } from "@/helpers/parse-peer-config-name"
import { api } from "@/lib/api/client"
import { DeletePeerConfigModal } from "@/modules/admin/ui/delete-peer-config-modal"
import { EditPeerConfigModal } from "@/modules/admin/ui/edit-peer-config-modal"

export function PeerConfigTable() {
  const searchParams = useSearchParams()
  const peerId = searchParams.get("peerId") ?? undefined

  const [siteSettings] = api.siteSettings.get.useSuspenseQuery()
  const [peerConfigs] = api.admin.peerConfigs.list.useSuspenseInfiniteQuery(
    { limit: siteSettings.defaultFetchLimit, peerId },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  // TODO: pagination

  return (
    <Table className="even:bg-muted">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Allowed IPs</TableHead>
          <TableHead>Endpoint</TableHead>
          <TableHead>DNS</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="text-right">Created At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {peerConfigs.pages
          .flatMap((page) => page.items)
          .map((peerConfig) => {
            const formattedName = parsePeerConfigName(peerConfig.name)

            return (
              <TableRow key={peerConfig.id}>
                <TableCell className="font-medium">{formattedName}</TableCell>
                <TableCell>{peerConfig.allowedIP}</TableCell>
                <TableCell>{peerConfig.endpoint}</TableCell>
                <TableCell>{peerConfig.dns}</TableCell>
                <TableCell>{peerConfig.user?.email}</TableCell>
                <TableCell className="text-right">
                  {new Date(peerConfig.createdAt).toDateString()}
                </TableCell>
                <TableCell className="flex justify-end gap-x-2">
                  <EditPeerConfigModal peerConfig={peerConfig} />
                  <DeletePeerConfigModal peerConfig={peerConfig} />
                </TableCell>
              </TableRow>
            )
          })}
      </TableBody>
    </Table>
  )
}
