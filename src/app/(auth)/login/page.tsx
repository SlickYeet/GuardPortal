import { redirect } from "next/navigation"

import { HydrateClient } from "@/lib/api/server"
import { getSession } from "@/lib/auth/utils"
import { LoginView } from "@/modules/auth/views/login"

export default async function Page() {
  const session = await getSession()

  if (session) return redirect("/")

  return (
    <HydrateClient>
      <LoginView />
    </HydrateClient>
  )
}
