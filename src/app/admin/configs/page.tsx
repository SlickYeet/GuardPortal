import { notFound } from "next/navigation"

import { isUserAdmin } from "@/helpers/is-user-admin"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { getSiteSettings } from "@/lib/site-settings"
import { PeerConfigsView } from "@/modules/admin/views/peer-configs"

export default async function Page({
  searchParams,
}: PageProps<"/admin/configs">) {
  const session = await getSession()
  const isAdmin = isUserAdmin(session)
  const siteSettings = await getSiteSettings()
  const { peerId } = await searchParams

  if (!session || !isAdmin) return notFound()
  if (peerId && typeof peerId !== "string") {
    throw new Error("peerId is invalid")
  }

  void api.siteSettings.get.prefetch()
  void api.admin.users.list.prefetchInfinite({
    limit: siteSettings.defaultFetchLimit,
  })
  void api.admin.wireguard.getAvailablePeerIPs.prefetch()
  void api.admin.peerConfigs.list.prefetchInfinite({
    limit: siteSettings.defaultFetchLimit,
    peerId,
  })

  return (
    <HydrateClient>
      <PeerConfigsView />
    </HydrateClient>
  )
}
