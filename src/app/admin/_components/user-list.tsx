"use client"

import {
  CheckCircle,
  Copy,
  Key,
  Loader2,
  RefreshCcw,
  Trash2,
  XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { deleteUser, getUsers, resetUserPassword } from "@/actions/user"
import { Hint } from "@/components/hint"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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

export function UsersList() {
  const [users, setUsers] = useState<UserWithConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isResetting, setIsResetting] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState<string | null>(null)

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

  async function handleDeleteUser() {
    if (!userToDelete) return

    setIsDeleting(true)
    try {
      await deleteUser(userToDelete)
      toast.success("Success", {
        description: "User deleted successfully",
      })
      loadUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast.error("Error", {
        description: `Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsDeleting(false)
      setUserToDelete(null)
    }
  }

  async function handleResetPassword(userId: string) {
    setIsResetting(userId)
    try {
      const result = await resetUserPassword(userId)
      if (result.success) {
        setNewPassword(result.tempPassword || "")
        toast.success("Password Reset", {
          description: "A new temporary password has been generated.",
        })
      } else {
        toast.error("Error", {
          description: result.message || "Failed to reset password",
        })
      }
    } catch (error) {
      console.error("Failed to reset password:", error)
      toast.error("Error", {
        description: `Failed to reset password: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsResetting(null)
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
                      <Hint label="Reset Password" asChild>
                        <Button
                          disabled={isResetting === user.id}
                          onClick={() => handleResetPassword(user.id)}
                          size="icon"
                          variant="outline"
                        >
                          {isResetting === user.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Key className="size-4" />
                          )}
                        </Button>
                      </Hint>
                      <Hint label="Delete User" asChild>
                        <Button
                          onClick={() => setUserToDelete(user.id)}
                          size="icon"
                          variant="destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </Hint>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user and their VPN configuration.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex w-full justify-between">
              <AlertDialogAction
                disabled={isDeleting}
                onClick={handleDeleteUser}
                className="bg-destructive hover:bg-destructive/80"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </AlertDialogAction>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {newPassword && (
        <AlertDialog
          open={!!newPassword}
          onOpenChange={(open) => !open && setNewPassword(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Password Reset</AlertDialogTitle>
              <AlertDialogDescription>
                A new temporary password has been generated. Make sure to copy
                it now as it won&apos;t be shown again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center justify-between rounded-md border p-2">
              <code className="font-mono text-sm">{newPassword}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(newPassword)
                  toast.success("Copied to clipboard", {
                    description:
                      "The new password has been copied to your clipboard.",
                  })
                }}
              >
                <Copy className="size-4" />
                Copy
              </Button>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setNewPassword(null)}>
                Done
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
