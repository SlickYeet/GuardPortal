import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { APP_NAME } from "@/constants"
import { parsePeerConfigName } from "@/helpers/parse-peer-config-name"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { DashboardView } from "@/modules/dashboard/views/dashboard"

export async function generateMetadata(): Promise<Metadata> {
  const session = await getSession()

  if (!session) {
    return {
      description: "Please log in to view your VPN configuration.",
      title: "Please log in to view your VPN configuration.",
    }
  }

  const config = await api.wireguard.getPeerConfigByUserId({
    userId: session.user.id,
  })

  if (!config) {
    return {
      description: "You have no VPN configuration set up yet.",
      title: "You have no VPN configuration set up yet.",
    }
  }

  const configName = parsePeerConfigName(config.name)

  return {
    title: `${configName} - ${APP_NAME}`,
  }
}

export default async function HomePage() {
  const session = await getSession()

  if (!session) return redirect("/login")

  void api.wireguard.getPeerConfigByUserId.prefetch({
    userId: session.user.id,
  })

  return (
    <HydrateClient>
      <DashboardView session={session} />
    </HydrateClient>
  )
}
