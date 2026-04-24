import { notFound } from "next/navigation"

import { UserMenu } from "@/components/user-menu"
import { APP_NAME } from "@/constants"
import { isUserAdmin } from "@/helpers/is-user-admin"
import { getSession } from "@/lib/auth/utils"
import { AdminTabs } from "@/modules/admin/ui/admin-tabs"

export default async function Layout({ children }: LayoutProps<"/">) {
  const session = await getSession()
  const isAdmin = isUserAdmin(session)

  if (!session || !isAdmin) return notFound()

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-between gap-x-4">
          <h1 className="mb-6 font-bold text-3xl">{APP_NAME} Admin</h1>
          <UserMenu isAdmin={isAdmin} user={session.user} />
        </div>
        <AdminTabs>{children}</AdminTabs>
      </div>
    </div>
  )
}
