import { notFound } from "next/navigation"

import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { isUserAdmin } from "@/helpers/is-user-admin"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { PeerConfigsView } from "@/modules/admin/views/peer-configs"

export default async function Page({
  searchParams,
}: PageProps<"/admin/configs">) {
  const session = await getSession()
  const isAdmin = isUserAdmin(session)
  const { peerId } = await searchParams

  if (!session || !isAdmin) return notFound()
  if (peerId && typeof peerId !== "string") {
    throw new Error("peerId is invalid")
  }

  void api.admin.users.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })
  void api.admin.wireguard.getAvailablePeerIPs.prefetch()
  void api.admin.peerConfigs.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
    peerId,
  })

  return (
    <HydrateClient>
      <PeerConfigsView />
    </HydrateClient>
  )
}
