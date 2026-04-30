"use client"

import { QrCodeIcon } from "lucide-react"
import QRCode from "react-qr-code"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FALLBACK_QR_URL } from "@/constants"
import { QRCodeDisplay } from "@/modules/dashboard/ui/qr-code-display"
import type { PeerConfig } from "@/server/db/schema"

interface QRCodeSectionProps {
  peerConfig: PeerConfig | null
}

export function QRCodeSection({ peerConfig }: QRCodeSectionProps) {
  return (
    <Card className="hidden md:flex">
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
        {peerConfig ? (
          <QRCodeDisplay peerConfig={peerConfig} />
        ) : (
          <div className="flex justify-center">
            <QRCode
              bgColor="#18181b"
              className="rounded-lg border"
              fgColor="#fafafa"
              value={FALLBACK_QR_URL}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
