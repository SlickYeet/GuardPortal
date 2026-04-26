"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangleIcon, Trash2Icon } from "lucide-react"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type * as z from "zod"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api/client"
import { deletePeerConfigSchema } from "@/modules/admin/schema/config"
import type { PeerConfig } from "@/server/db/schema"

interface DeletePeerConfigModalProps {
  peerConfig: PeerConfig
}

export function DeletePeerConfigModal({
  peerConfig,
}: DeletePeerConfigModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <ResponsiveModal
      alert
      className="max-md:min-h-full"
      onOpenChange={setIsOpen}
      open={isOpen}
      trigger={{
        children: <Trash2Icon />,
        size: "icon",
        variant: "destructive",
      }}
    >
      <DeletePeerConfigForm peerConfig={peerConfig} setOpen={setIsOpen} />
    </ResponsiveModal>
  )
}

interface DeletePeerConfigFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  peerConfig: PeerConfig
}

function DeletePeerConfigForm({
  setOpen,
  peerConfig,
}: DeletePeerConfigFormProps) {
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof deletePeerConfigSchema>>({
    defaultValues: {
      id: peerConfig.id,
    },
    resolver: zodResolver(deletePeerConfigSchema),
  })

  const deletePeerConfig = api.admin.peerConfigs.delete.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess() {
      toast.success("Peer config deleted successfully")
      void utils.admin.peerConfigs.list.invalidate()
      void utils.admin.wireguard.getAvailablePeerIPs.invalidate()
      form.reset()
      setOpen(false)
    },
  })

  function onSubmit(data: z.infer<typeof deletePeerConfigSchema>) {
    deletePeerConfig.mutate(data)
  }

  const isPending = form.formState.isSubmitting || deletePeerConfig.isPending

  return (
    <>
      <Alert className="max-md:mb-4" variant="warning">
        <AlertTriangleIcon />
        <AlertTitle>
          Are you sure you want to delete this peer config? This action cannot
          be undone.
        </AlertTitle>
        <AlertDescription>
          This will delete the user's WireGuard peer config.
        </AlertDescription>
      </Alert>

      <Alert className="border-0">
        <AlertTitle>
          You are about to delete the following peer config
        </AlertTitle>
        <AlertDescription className="mt-2 rounded-2xl bg-muted p-4">
          <strong>
            <code>{peerConfig.name}</code>
          </strong>
        </AlertDescription>
      </Alert>

      <form
        className="flex items-center justify-end gap-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
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
          Delete Peer Config
        </Button>
      </form>
    </>
  )
}
