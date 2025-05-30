"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type User } from "better-auth"
import { Loader2, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { deleteUser } from "@/actions/user"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Form, FormField } from "@/components/ui/form"
import { DeleteUserSchema } from "@/schemas/user"
import { type UserWithConfig } from "@/types"

interface DeleteUserProps {
  user: UserWithConfig
  currentUser: User
  loadUsers: () => Promise<void>
}

export function DeleteUser({ user, currentUser, loadUsers }: DeleteUserProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<z.infer<typeof DeleteUserSchema>>({
    resolver: zodResolver(DeleteUserSchema),
    defaultValues: {
      userId: user.id,
    },
  })

  async function onSubmit(values: z.infer<typeof DeleteUserSchema>) {
    if (!values.userId) return

    try {
      await deleteUser(values)
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
      setIsDialogOpen(false)
      form.reset()
    }
  }

  const pending = form.formState.isSubmitting

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Hint label="Delete User" asChild>
        <AlertDialogTrigger asChild>
          <Button
            disabled={currentUser.id === user.id}
            size="icon"
            variant="destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </AlertDialogTrigger>
      </Hint>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the user and their VPN configuration.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => <input type="hidden" {...field} />}
            />
            <AlertDialogFooter>
              <div className="flex w-full justify-between">
                <AlertDialogAction
                  type="submit"
                  disabled={pending}
                  className="bg-destructive hover:bg-destructive/80"
                >
                  {pending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </AlertDialogAction>
                <AlertDialogCancel type="button" disabled={pending}>
                  Cancel
                </AlertDialogCancel>
              </div>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
