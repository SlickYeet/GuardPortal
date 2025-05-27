import { ArrowLeft } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TabsContent } from "@/components/ui/tabs"
import { isUserAdmin } from "@/lib/utils"
import { auth } from "@/server/auth"

import { CreateUserForm } from "./_components/create-user-form"
import { AdminTabs } from "./_components/tabs"
import { UsersList } from "./_components/user-list"

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const isAdmin = isUserAdmin(session?.user)

  if (!session?.session || !session?.user || !isAdmin) {
    return redirect("/")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <h1 className="mb-6 text-3xl font-bold">VPN Admin Dashboard</h1>
        <Button variant="outline" asChild>
          <Link href="/vpn" className="text-sm">
            <ArrowLeft className="size-4" />
            Go to VPN Details
          </Link>
        </Button>
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
                <UsersList />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </AdminTabs>
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

function UsersListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
