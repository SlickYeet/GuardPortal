import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isUserAdmin } from "@/lib/utils"
import { auth } from "@/server/auth"

import { CreateUserForm } from "./_components/create-user-form"
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
      <h1 className="mb-6 text-3xl font-bold">VPN Admin Dashboard</h1>

      <Tabs defaultValue="create-user" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create-user">Create User</TabsTrigger>
          <TabsTrigger value="manage-users">Manage Users</TabsTrigger>
        </TabsList>

        <TabsContent value="create-user">
          <Card>
            <CardHeader>
              <CardTitle>Create New VPN User</CardTitle>
              <CardDescription>
                Create a new user with a temporary password and assign an IP
                address
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
      </Tabs>
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
