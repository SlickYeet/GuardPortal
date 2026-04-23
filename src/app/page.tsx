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
      title: APP_NAME,
    }
  }

  const user = session.user
  const userName =
    user.name.charAt(0).toUpperCase() + user.name.slice(1) || user.email

  const config = await api.wireguard.getPeerConfigByUserId({
    userId: user.id,
  })

  if (!config) {
    return {
      description: "You have no VPN configuration set up yet.",
      title: `${userName} - ${APP_NAME}`,
    }
  }

  const configName = parsePeerConfigName(config.name)

  return {
    title: `${configName} - ${userName}`,
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
