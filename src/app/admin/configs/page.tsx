import { notFound } from "next/navigation"

import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { isUserAdmin } from "@/helpers/is-user-admin"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { PeerConfigsView } from "@/modules/admin/views/peer-configs"

export default async function Page() {
  const session = await getSession()
  const isAdmin = isUserAdmin(session)

  if (!session || !isAdmin) return notFound()

  void api.admin.peerConfigs.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })

  return (
    <HydrateClient>
      <PeerConfigsView />
    </HydrateClient>
  )
}
