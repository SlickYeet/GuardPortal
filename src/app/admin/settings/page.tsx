import { notFound } from "next/navigation"

import { isUserAdmin } from "@/helpers/is-user-admin"
import { api, HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { SiteSettingsView } from "@/modules/admin/views/site-settings"

export default async function Page() {
  const session = await getSession()
  const isAdmin = isUserAdmin(session)

  if (!session || !isAdmin) return notFound()

  void api.siteSettings.get.prefetch()

  return (
    <HydrateClient>
      <SiteSettingsView />
    </HydrateClient>
  )
}
