import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { getDefaultPeerConfig } from "@/actions/wireguard"
import { CreateConfigForm } from "@/app/admin/_components/create-config-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TabsContent } from "@/components/ui/tabs"
import { UserMenu } from "@/components/user-menu"
import { isUserAdmin } from "@/lib/utils"
import { auth } from "@/server/auth"

import { AccessRequestList } from "./_components/access-request-list"
import { ConfigList } from "./_components/config-list"
import { CreateUserForm } from "./_components/create-user-form"
import { AdminTabs } from "./_components/tabs"
import { UsersList } from "./_components/user-list"

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const currentUser = session?.user

  const isAdmin = isUserAdmin(currentUser)

  if (!session?.session || !currentUser || !isAdmin) {
    return redirect("/")
  }
  const defaultConfig = await getDefaultPeerConfig()

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-between gap-x-4">
          <h1 className="mb-6 text-3xl font-bold">VPN Admin Dashboard</h1>
          <UserMenu user={currentUser} isAdmin={isAdmin} />
        </div>

        <AdminTabs>
          <TabsContent value="create-user">
            <Card>
              <CardHeader>
                <CardTitle>Create New VPN User</CardTitle>
                <CardDescription>
                  Create a new user with a temporary password and assign an IP
                  address.
                  <br />
                  An email will be sent to the user with their credentials.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<CreateUserFormSkeleton />}>
                  <CreateUserForm />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-users">
            <Card>
              <CardHeader>
                <CardTitle>Manage VPN Users</CardTitle>
                <CardDescription>
                  View and manage existing VPN users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<UsersListSkeleton />}>
                  <UsersList currentUser={currentUser} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-config">
            <Card>
              <CardHeader>
                <CardTitle>Create VPN Config</CardTitle>
                <CardDescription>
                  Generate a new VPN configuration file for an existing user.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<CreateConfigFormSkeleton />}>
                  <CreateConfigForm defaultConfig={defaultConfig} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-configs">
            <Card>
              <CardHeader>
                <CardTitle>Manage VPN Configs</CardTitle>
                <CardDescription>
                  View and manage existing VPN configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConfigList defaultConfig={defaultConfig} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access-requests">
            <Card>
              <CardHeader>
                <CardTitle>Access Requests</CardTitle>
                <CardDescription>
                  Manage access requests from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccessRequestList />
              </CardContent>
            </Card>
          </TabsContent>
        </AdminTabs>
      </div>
    </div>
  )
}

function CreateUserFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-1/3" />
    </div>
  )
}

function CreateConfigFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-1/3" />
    </div>
  )
}

function UsersListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
