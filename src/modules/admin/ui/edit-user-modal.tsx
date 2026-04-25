"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { EditIcon, SaveIcon } from "lucide-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type * as z from "zod"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api/client"
import type { User } from "@/lib/auth/utils"
import { userInsertSchema } from "@/server/db/schema"

interface EditUserModalProps {
  currentUserId: string
  user: User
}

export function EditUserModal({ currentUserId, user }: EditUserModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <ResponsiveModal
      className="max-md:min-h-full"
      onOpenChange={setIsOpen}
      open={isOpen}
      trigger={{
        children: <EditIcon />,
        disabled: user.id === currentUserId,
        size: "icon",
        variant: "outline",
      }}
    >
      <EditUserForm
        currentUserId={currentUserId}
        setOpen={setIsOpen}
        user={user}
      />
    </ResponsiveModal>
  )
}

interface EditUserFormProps {
  currentUserId: string
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  user: User
}

function EditUserForm({ currentUserId, setOpen, user }: EditUserFormProps) {
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof userInsertSchema>>({
    defaultValues: user,
    resolver: zodResolver(userInsertSchema),
  })

  const editUser = api.admin.users.update.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("User updated successfully")
      void utils.admin.users.list.invalidate()
      form.reset()
      setOpen(false)
    },
  })

  async function onSubmit(data: z.infer<typeof userInsertSchema>) {
    if (user.id === currentUserId) {
      toast.error("You cannot edit your own user.")
      return
    }

    console.log(data)
  }

  const isPending = form.formState.isSubmitting || editUser.isPending

  return (
    <form id="edit-user-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  disabled={isPending}
                  id={field.name}
                  placeholder="Enter username"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  disabled={isPending}
                  id={field.name}
                  placeholder="Enter email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="role"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Select
                disabled={isPending}
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger
                  aria-invalid={fieldState.invalid}
                  id={field.name}
                >
                  <SelectValue
                    className="capitalize"
                    placeholder="Select a role"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="emailVerified"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Email Verified</FieldLabel>
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
        <Controller
          control={form.control}
          name="banned"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Banned</FieldLabel>
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

        <Controller
          control={form.control}
          name="banReason"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Ban Reason</FieldLabel>
              <Textarea
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                className="resize-none"
                disabled={isPending || !form.watch("banned")}
                id={field.name}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                placeholder="Enter the reason for the ban"
                ref={field.ref}
                value={field.value ?? ""}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="banExpires"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Ban Expires</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  disabled={isPending || !form.watch("banned")}
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    const value = event.target.value
                    field.onChange(value ? new Date(value) : null)
                  }}
                  type="date"
                  value={
                    field.value
                      ? new Date(field.value).toISOString().split("T")[0]
                      : ""
                  }
                />
              </InputGroup>
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
            {isPending ? <Spinner /> : <SaveIcon />}
            Save changes
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
