"use client"

import { type User } from "better-auth"
import {
  CheckCircle,
  Copy,
  CopyCheck,
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
import { Input } from "@/components/ui/input"
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

export function UsersList({ currentUser }: { currentUser: User }) {
  const [users, setUsers] = useState<UserWithConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userToResetPassword, setUserToResetPassword] = useState<string | null>(
    null,
  )
  const [isResettings, setIsResettings] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

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
    if (!userId) return

    setIsResettings(true)
    try {
      const result = await resetUserPassword(userId)
      if (result.success) {
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
      setIsResettings(false)
      setUserToResetPassword(null)
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
                          disabled={!!userToResetPassword}
                          onClick={() => setUserToResetPassword(user.id)}
                          size="icon"
                          variant="outline"
                        >
                          {isResettings ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Key className="size-4" />
                          )}
                        </Button>
                      </Hint>
                      <Hint label="Delete User" asChild>
                        <Button
                          disabled={currentUser.id === user.id || isDeleting}
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

      <AlertDialog
        open={!!userToResetPassword}
        onOpenChange={(open) => !open && setUserToResetPassword(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password Reset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to generate a new temporary password for
              this user? They will need to use this new password to log in.
              <br />
              <span className="font-bold">NOTE:</span> An email will be sent to
              the user with the new credentials.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <div className="flex w-full justify-between">
              <AlertDialogCancel disabled={isResettings}>
                Cancel
              </AlertDialogCancel>
              <Button
                disabled={!userToResetPassword}
                onClick={() => handleResetPassword(userToResetPassword!)}
                variant="destructive"
              >
                {isResettings ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <Key className="size-4" />
                    <span>Reset Password</span>
                  </>
                )}
              </Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
