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
import { parsePeerConfigName } from "@/helpers/parse-peer-config-name"
import { PeerConfigDownloadButtons } from "@/modules/dashboard/ui/peer-config-download-buttons"
import type { PeerConfig } from "@/server/db/schema"

interface ConfigDetailsSectionProps {
  peerConfig: PeerConfig
  isAdmin: boolean
}

export function ConfigDetailsSection({
  peerConfig,
  isAdmin,
}: ConfigDetailsSectionProps) {
  // TODO suspense

  const configName = parsePeerConfigName(peerConfig.name)

  const CONFIG_DETAILS = [
    { icon: FileTextIcon, label: "Name", value: configName },
    { icon: ServerIcon, label: "Server", value: peerConfig.endpoint },
    { icon: GlobeIcon, label: "Allowed IPs", value: peerConfig.allowedIPs },
    { icon: CloudCogIcon, label: "DNS", value: peerConfig.dns },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              <Settings2Icon className="mr-2 inline-block size-4" />
              Configuration Details
            </CardTitle>
            <CardDescription>
              Your WireGuard configuration details
            </CardDescription>
          </div>
          {isAdmin && (
            <Button
              nativeButton={false}
              render={
                <Link href={`/admin/manage-peers&peerId=${peerConfig.id}`} />
              }
            >
              <EditIcon />
              <span className="sr-only">Edit Configuration</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {CONFIG_DETAILS.map(({ label, value, icon: Icon }) => (
          <div key={label}>
            <Label className="text-muted-foreground">
              <Icon className="size-3.5" />
              {label}
            </Label>
            <p className="text-sm">{value}</p>
          </div>
        ))}
        <PeerConfigDownloadButtons peerConfig={peerConfig} />
      </CardContent>
    </Card>
  )
}
