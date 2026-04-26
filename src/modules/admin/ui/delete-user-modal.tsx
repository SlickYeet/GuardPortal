"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangleIcon, Trash2Icon } from "lucide-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type * as z from "zod"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { api } from "@/lib/api/client"
import type { User } from "@/lib/auth/utils"
import { deleteUserSchema } from "@/modules/admin/schema/user"

interface DeleteUserModalProps {
  currentUserId: string
  user: User
}

export function DeleteUserModal({ currentUserId, user }: DeleteUserModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <ResponsiveModal
      alert
      className="max-md:min-h-full"
      onOpenChange={setIsOpen}
      open={isOpen}
      trigger={{
        children: <Trash2Icon />,
        disabled: user.id === currentUserId,
        variant: "destructive",
      }}
    >
      <DeleteUserForm
        currentUserId={currentUserId}
        setOpen={setIsOpen}
        user={user}
      />
    </ResponsiveModal>
  )
}

interface DeleteUserFormProps {
  currentUserId: string
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  user: User
}

function DeleteUserForm({ currentUserId, setOpen, user }: DeleteUserFormProps) {
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof deleteUserSchema>>({
    defaultValues: {
      deleteConfig: true,
      id: user.id,
    },
    resolver: zodResolver(deleteUserSchema),
  })

  const deleteUser = api.admin.users.delete.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("User deleted successfully")
      void utils.admin.users.list.invalidate()
      form.reset()
      setOpen(false)
    },
  })

  function onSubmit(data: z.infer<typeof deleteUserSchema>) {
    if (user.id === currentUserId) {
      toast.error("You cannot delete your own user.")
      return
    }

    deleteUser.mutate(data)
  }

  const isPending = form.formState.isSubmitting || deleteUser.isPending

  return (
    <>
      <Alert className="max-md:mb-4" variant="warning">
        <AlertTriangleIcon />
        <AlertTitle>
          Deleting users through GuardPortal is not recommended
        </AlertTitle>
        <AlertDescription>
          Instead, use your identity provider's user management system to delete
          users.
        </AlertDescription>
      </Alert>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="deleteConfig"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>
                    Delete Configuration
                  </FieldLabel>
                  <FieldDescription>
                    This will delete the user's WireGuard peer config.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
                <Switch
                  aria-invalid={fieldState.invalid}
                  checked={field.value ?? false}
                  disabled={isPending}
                  id={field.name}
                  name={field.name}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />

          <div className="flex items-center justify-end gap-2">
            <Button
              disabled={isPending}
              onClick={() => {
                form.reset()
                setOpen(false)
              }}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? <Spinner /> : <Trash2Icon />}
              Delete User
            </Button>
          </div>
        </FieldGroup>
      </form>
    </>
  )
}
