"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangleIcon, InfoIcon, UserPlusIcon } from "lucide-react"
import Link from "next/link"
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { useIsMobile } from "@/hooks/use-mobile"
import { api } from "@/lib/api/client"
import { userInsertSchema } from "@/server/db/schema"

export function CreateUserModal() {
  const isMobile = useIsMobile()

  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <ResponsiveModal
      className="max-md:min-h-full"
      onOpenChange={setIsOpen}
      open={isOpen}
      trigger={{
        children: (
          <>
            <UserPlusIcon /> {isMobile ? null : "Add User"}
          </>
        ),
        size: isMobile ? "icon" : "default",
        variant: "secondary",
      }}
    >
      <CreateUserForm setOpen={setIsOpen} />
    </ResponsiveModal>
  )
}

const formSchema = userInsertSchema.pick({
  email: true,
  emailVerified: true,
  name: true,
  role: true,
})

interface CreateUserFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function CreateUserForm({ setOpen }: CreateUserFormProps) {
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      email: "",
      emailVerified: false,
      name: "",
      role: "user",
    },
    resolver: zodResolver(formSchema),
  })

  const createUser = api.admin.users.create.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("User created successfully")
      void utils.admin.users.list.invalidate()
      form.reset()
      setOpen(false)
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    createUser.mutate(data)
  }

  const isPending = form.formState.isSubmitting || createUser.isPending

  return (
    <>
      <Alert className="max-md:mb-4" variant="warning">
        <AlertTriangleIcon />
        <AlertTitle>
          Creating users through GuardPortal is not recommended.
        </AlertTitle>
        <AlertDescription>
          Instead, use your identity provider's user management system to create
          users.
        </AlertDescription>
      </Alert>

      <form onSubmit={form.handleSubmit(onSubmit)}>
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

          <Alert variant="info">
            <InfoIcon />
            <AlertTitle>
              A peer config will be automatically generated for the user.
            </AlertTitle>
            <AlertDescription>
              You can edit it{" "}
              <Link
                className="underline underline-offset-2 transition-all hover:text-primary"
                href="/admin/configs"
              >
                here
              </Link>{" "}
              after creating the user.
            </AlertDescription>
          </Alert>

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
              {isPending ? <Spinner /> : <UserPlusIcon />}
              Create User
            </Button>
          </div>
        </FieldGroup>
      </form>
    </>
  )
}
