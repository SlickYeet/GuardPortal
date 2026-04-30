import { ArrowLeftIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import { isUserAdmin } from "@/helpers/is-user-admin"
import { getSession } from "@/lib/auth/utils"
import { getSiteSettings } from "@/lib/site-settings"
import { AdminTabs } from "@/modules/admin/ui/admin-tabs"

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings()

  return {
    description: `${siteSettings.appName} Admin Dashboard`,
    title: `${siteSettings.appName} Admin`,
  }
}

export default async function Layout({ children }: LayoutProps<"/">) {
  const session = await getSession()
  const isAdmin = isUserAdmin(session)
  const siteSettings = await getSiteSettings()

  if (!session || !isAdmin) return notFound()

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="@container mb-6 flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            <Button
              nativeButton={false}
              render={<Link href="/" />}
              size="icon-lg"
              variant="ghost"
            >
              <ArrowLeftIcon className="size-6" />
            </Button>
            <h1 className="font-bold text-3xl">
              <span className="@md:inline hidden">{siteSettings.appName}</span>{" "}
              Admin
            </h1>
          </div>
          <UserMenu isAdmin={isAdmin} user={session.user} />
        </div>
        <AdminTabs />
        <main className="mt-4">{children}</main>
      </div>
    </div>
  )
}
