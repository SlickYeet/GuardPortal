"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type User } from "better-auth"
import { Key, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { resetUserPassword } from "@/actions/user"
import { Hint } from "@/components/hint"
import {
  AlertDialog,
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
import { ResetUserPasswordSchema } from "@/schemas/user"
import type { UserWithConfig } from "@/types"

interface ResetUserPasswordProps {
  user: UserWithConfig
  currentUser: User
}

export function ResetUserPassword({
  user,
  currentUser,
}: ResetUserPasswordProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<z.infer<typeof ResetUserPasswordSchema>>({
    resolver: zodResolver(ResetUserPasswordSchema),
    defaultValues: {
      userId: user.id,
    },
  })

  async function onSubmit(values: z.infer<typeof ResetUserPasswordSchema>) {
    if (!values.userId) return

    try {
      const result = await resetUserPassword(values)
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
      setIsDialogOpen(false)
      form.reset()
    }
  }

  const pending = form.formState.isSubmitting

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Hint label="Reset Password" asChild>
        <AlertDialogTrigger asChild>
          <Button
            disabled={currentUser.id === user.id}
            size="icon"
            variant="outline"
          >
            <Key className="size-4" />
          </Button>
        </AlertDialogTrigger>
      </Hint>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Password Reset</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to generate a new temporary password for this
            user? They will need to use this new password to log in.
            <br />
            <span className="font-bold">NOTE:</span> An email will be sent to
            the user with the new credentials.
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
                <AlertDialogCancel type="button" disabled={pending}>
                  Cancel
                </AlertDialogCancel>
                <Button type="submit" disabled={!user.id} variant="destructive">
                  {pending ? (
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
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
