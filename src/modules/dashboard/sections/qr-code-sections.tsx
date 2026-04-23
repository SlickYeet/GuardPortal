"use client"

import { QrCodeIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { QRCodeDisplay } from "@/modules/dashboard/ui/qr-code-display"
import type { PeerConfig } from "@/server/db/schema"

export function QRCodeSection({ peerConfig }: { peerConfig: PeerConfig }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCodeIcon className="inline-block size-5" />
          QR Code
        </CardTitle>
        <CardDescription>
          Scan this QR code with your WireGuard app to import the configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QRCodeDisplay peerConfig={peerConfig} />
      </CardContent>
    </Card>
  )
}
