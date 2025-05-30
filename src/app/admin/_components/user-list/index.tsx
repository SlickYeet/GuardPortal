"use client"

import { type User } from "better-auth"
import { CheckCircle, Loader2, RefreshCcw, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { getUsers } from "@/actions/user"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { UserWithConfig } from "@/types"

import { DeleteUser } from "./delete-user"
import { ResetUserPassword } from "./reset-user-password"

export function UsersList({ currentUser }: { currentUser: User }) {
  const [users, setUsers] = useState<UserWithConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setIsLoading(true)
    try {
      const fetchedUsers = await getUsers()
      setUsers(fetchedUsers as UserWithConfig[])
    } catch (error) {
      console.error("Failed to load users:", error)
      toast.error("Error", {
        description: `Failed to load users: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">VPN Users</h2>
        <Button disabled={isLoading} onClick={loadUsers} variant="outline">
          <RefreshCcw
            className={cn("size-4", isLoading ? "animate-spin" : "")}
          />
          <span>Refresh</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-muted-foreground p-8 text-center">
          <p>No users found.</p>
          <p className="tex-sm">Create a new user to get started.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="text-center">Updated Password</TableHead>
                <TableHead className="text-center">Verified Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.config ? user.config.allowedIPs : "No config"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      {user.emailVerified ? (
                        <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="text-destructive size-4" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      {!user.isFirstLogin ? (
                        <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="text-destructive size-4" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      <ResetUserPassword
                        user={user}
                        currentUser={currentUser}
                      />
                      <DeleteUser
                        user={user}
                        currentUser={currentUser}
                        loadUsers={loadUsers}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
