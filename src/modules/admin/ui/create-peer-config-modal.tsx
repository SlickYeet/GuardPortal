"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FileCogIcon, PlusIcon } from "lucide-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type * as z from "zod"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox"
import {
  Field,
  FieldContent,
  FieldDescription,
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
import { useIsMobile } from "@/hooks/use-mobile"
import { api } from "@/lib/api/client"
import { peerConfigInsertSchema } from "@/modules/admin/schema/config"

export function CreatePeerConfigModal() {
  const isMobile = useIsMobile()

  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <ResponsiveModal
      className="max-md:min-h-full"
      modal={false}
      onOpenChange={setIsOpen}
      open={isOpen}
      trigger={{
        children: (
          <>
            <FileCogIcon /> {isMobile ? null : "Add Peer Config"}
          </>
        ),
        size: isMobile ? "icon" : "default",
        variant: "secondary",
      }}
    >
      <CreatePeerConfigForm setOpen={setIsOpen} />
    </ResponsiveModal>
  )
}

const formSchema = peerConfigInsertSchema.omit({
  id: true,
})

interface CreatePeerConfigFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function CreatePeerConfigForm({ setOpen }: CreatePeerConfigFormProps) {
  const utils = api.useUtils()

  const [siteSettings] = api.siteSettings.get.useSuspenseQuery()
  const [users] = api.admin.users.list.useSuspenseInfiniteQuery(
    { limit: siteSettings.defaultFetchLimit },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )
  const [availableIPs] =
    api.admin.wireguard.getAvailablePeerIPs.useSuspenseQuery()
  const firstAvailableIP = Object.values(availableIPs)[0]?.[0]
  const availableIPsBySubnet = Object.entries(availableIPs).map(
    ([subnet, ips]) => ({
      items: ips,
      value: subnet,
    }),
  )

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      allowedIP: firstAvailableIP,
    },
    resolver: zodResolver(formSchema),
  })

  const createPeerConfig = api.admin.peerConfigs.create.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Peer config created successfully")
      void utils.admin.peerConfigs.list.invalidate()
      void utils.admin.wireguard.getAvailablePeerIPs.invalidate()
      form.reset()
      setOpen(false)
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    createPeerConfig.mutate(data)
  }

  const isPending = form.formState.isSubmitting || createPeerConfig.isPending

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Config Name (Optional)
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                disabled={isPending}
                id={field.name}
                placeholder="Enter config name"
              />
              <FieldDescription>
                A name to help you identify this peer config. If left empty, the
                name will be generated from the users name.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="allowedIP"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Allowed IP</FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Combobox
                autoHighlight
                defaultValue={firstAvailableIP}
                disabled={isPending}
                items={availableIPsBySubnet}
                onValueChange={field.onChange}
                value={field.value}
              >
                <ComboboxInput
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                  disabled={isPending}
                  id={field.name}
                  placeholder="Select an IP address..."
                  showClear
                />
                <ComboboxContent>
                  <ComboboxEmpty>No available IPs</ComboboxEmpty>
                  <ComboboxList>
                    {(group, index) => (
                      <ComboboxGroup items={group.items} key={group.value}>
                        <ComboboxLabel>Subnet {group.value}</ComboboxLabel>
                        <ComboboxCollection>
                          {(item) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          )}
                        </ComboboxCollection>
                        {index < availableIPsBySubnet.length - 1 && (
                          <ComboboxSeparator />
                        )}
                      </ComboboxGroup>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="userId"
          render={({ field, fieldState }) => {
            const selectedUser = users.pages
              .flatMap((page) => page.items)
              .find((user) => user.id === field.value)

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>User</FieldLabel>
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
                    {selectedUser ? (
                      <p>
                        {selectedUser.name}{" "}
                        <span className="text-muted-foreground">
                          ({selectedUser.email})
                        </span>
                      </p>
                    ) : (
                      <SelectValue placeholder="Select a user" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {users.pages
                      .flatMap((page) => page.items)
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <p>
                            {user.name}{" "}
                            <span className="text-muted-foreground">
                              ({user.email})
                            </span>
                          </p>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Field>
            )
          }}
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
            {isPending ? <Spinner /> : <PlusIcon />}
            Create Peer Config
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
