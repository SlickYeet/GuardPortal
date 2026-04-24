import { notFound } from "next/navigation"

import { isUserAdmin } from "@/helpers/is-user-admin"
import { HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { PeerConfigsView } from "@/modules/admin/views/peer-configs"

export default async function Page() {
  const session = await getSession()
  const isAdmin = isUserAdmin(session)

  if (!session || !isAdmin) return notFound()

  return (
    <HydrateClient>
      <PeerConfigsView />
    </HydrateClient>
  )
}
