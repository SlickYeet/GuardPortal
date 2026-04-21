import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/utils"

export default async function Page() {
  const session = await getSession()

  if (session) return redirect("/")

  return (
    <div>
      <h1>Page</h1>
    </div>
  )
}
