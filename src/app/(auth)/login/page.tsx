import { redirect } from "next/navigation"

import { HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { getSiteSettings } from "@/lib/site-settings"
import { LoginView } from "@/modules/auth/views/login"

export default async function Page() {
  const session = await getSession()
  const siteSettings = await getSiteSettings()

  if (session) return redirect("/")

  return (
    <HydrateClient>
      <LoginView appName={siteSettings.appName} />
    </HydrateClient>
  )
}
