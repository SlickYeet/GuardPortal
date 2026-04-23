"use client"

import QRCode from "react-qr-code"

import { peerConfigToWGConfig } from "@/helpers/peer-config-to-wg-config"
import { useIsMobile } from "@/hooks/use-mobile"
import type { PeerConfig } from "@/server/db/schema"

interface QRCodeDisplayProps {
  peerConfig: PeerConfig
  size?: number
}

export function QRCodeDisplay({ peerConfig, size }: QRCodeDisplayProps) {
  const isMobile = useIsMobile()
  if (isMobile) size = 200

  const peerConfigString = peerConfigToWGConfig(peerConfig)

  return (
    <div className="flex justify-center">
      <QRCode
        bgColor="#18181b"
        className="rounded-lg border"
        fgColor="#fafafa"
        size={size}
        value={peerConfigString}
      />
    </div>
  )
}
