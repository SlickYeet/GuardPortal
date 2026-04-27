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
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api } from "@/lib/api/client"
import { peerConfigInsertSchema } from "@/modules/admin/schema/config"
import type { PeerConfig } from "@/server/db/schema"

interface EditPeerConfigModalProps {
  peerConfig: PeerConfig
}

export function EditPeerConfigModal({ peerConfig }: EditPeerConfigModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <ResponsiveModal
      className="max-md:min-h-full"
      onOpenChange={setIsOpen}
      open={isOpen}
      trigger={{
        children: <EditIcon />,
        size: "icon",
        variant: "outline",
      }}
    >
      <EditPeerConfigForm peerConfig={peerConfig} setOpen={setIsOpen} />
    </ResponsiveModal>
  )
}

interface EditPeerConfigFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  peerConfig: PeerConfig
}

function EditPeerConfigForm({ setOpen, peerConfig }: EditPeerConfigFormProps) {
  const utils = api.useUtils()

  const [users] = api.admin.users.list.useSuspenseInfiniteQuery(
    { limit: DEFAULT_FETCH_LIMIT },
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

  const form = useForm<z.infer<typeof peerConfigInsertSchema>>({
    defaultValues: peerConfig,
    resolver: zodResolver(peerConfigInsertSchema),
  })

  const updatePeerConfig = api.admin.peerConfigs.update.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Peer config updated successfully")
      void utils.admin.peerConfigs.list.invalidate()
      form.reset()
      setOpen(false)
    },
  })

  function onSubmit(data: z.infer<typeof peerConfigInsertSchema>) {
    updatePeerConfig.mutate(data)
  }

  const isPending = form.formState.isSubmitting || updatePeerConfig.isPending

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="id"
          render={({ field }) => <input {...field} type="hidden" />}
        />

        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Config Name</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                disabled={isPending}
                id={field.name}
                placeholder="Enter config name"
              />
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
            {isPending ? <Spinner /> : <SaveIcon />}
            Save changes
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
