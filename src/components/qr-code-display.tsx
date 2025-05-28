"use client"

import { type PeerConfig } from "@prisma/client"
import QRCode from "react-qr-code"

import { useIsMobile } from "@/hooks/use-mobile"

interface QRCodeDisplayProps {
  config: PeerConfig
  size?: number
}

export function QRCodeDisplay({ config, size = 256 }: QRCodeDisplayProps) {
  const isMobile = useIsMobile()
  if (isMobile) {
    size = 200
  }

  const configString = JSON.stringify(config)

  return (
    <div className="flex justify-center">
      <QRCode
        value={configString}
        size={size}
        bgColor="#18181b"
        fgColor="#fafafa"
        className="rounded-lg border"
      />
    </div>
  )
}
