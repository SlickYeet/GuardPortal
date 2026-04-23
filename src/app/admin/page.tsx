import { notFound } from "next/navigation"

import { isUserAdmin } from "@/helpers/is-user-admin"
import { getSession } from "@/lib/auth/utils"
import { getDefaultPeerConfig } from "@/lib/wireguard"

export default async function Page() {
  const session = await getSession()
  const isAdmin = isUserAdmin(session)

  if (!session || !isAdmin) return notFound()

  const defaultPeerConfig = await getDefaultPeerConfig()

  return (
    <div>
      <pre>{defaultPeerConfig}</pre>
    </div>
  )
}
