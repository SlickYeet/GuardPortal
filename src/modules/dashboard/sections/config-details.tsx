"use client"

import {
  CloudCogIcon,
  EditIcon,
  FileTextIcon,
  GlobeIcon,
  ServerIcon,
  Settings2Icon,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { parsePeerConfigName } from "@/helpers/parse-peer-config-name"
import { PeerConfigDownloadButtons } from "@/modules/dashboard/ui/peer-config-download-buttons"
import type { PeerConfig } from "@/server/db/schema"

interface ConfigDetailsSectionProps {
  peerConfig: PeerConfig | null
  isAdmin: boolean
}

export function ConfigDetailsSection({
  peerConfig,
  isAdmin,
}: ConfigDetailsSectionProps) {
  const configName = peerConfig ? parsePeerConfigName(peerConfig.name) : null

  const CONFIG_DETAILS = [
    {
      icon: FileTextIcon,
      label: "Name",
      value: configName,
    },
    {
      icon: ServerIcon,
      label: "Server",
      value: peerConfig?.endpoint ?? null,
    },
    {
      icon: GlobeIcon,
      label: "Allowed IPs",
      value: peerConfig?.allowedIP ?? null,
    },
    {
      icon: CloudCogIcon,
      label: "DNS",
      value: peerConfig?.dns ?? null,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2Icon className="inline-block size-5" />
              Configuration Details
            </CardTitle>
            <CardDescription>
              Your WireGuard configuration details
            </CardDescription>
          </div>
          {isAdmin && peerConfig && (
            <Button
              nativeButton={false}
              render={<Link href={`/admin/configs?peerId=${peerConfig.id}`} />}
              size="icon"
              variant="secondary"
            >
              <EditIcon />
              <span className="sr-only">Edit Configuration</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex h-full flex-col justify-between gap-y-4">
        {CONFIG_DETAILS.map(({ label, value, icon: Icon }) => (
          <div key={label}>
            <Label className="text-muted-foreground">
              <Icon className="size-3.5" />
              {label}
            </Label>
            {value ? (
              <p className="text-sm">{value}</p>
            ) : (
              <Skeleton className="mt-1 h-4 w-40 rounded-md" />
            )}
          </div>
        ))}
        {peerConfig ? (
          <PeerConfigDownloadButtons peerConfig={peerConfig} />
        ) : (
          <div className="space-y-2 pt-4">
            <Skeleton className="h-9 w-full rounded-2xl" />
            <Skeleton className="h-9 w-full rounded-2xl" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
