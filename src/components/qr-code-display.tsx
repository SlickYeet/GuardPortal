"use client"

import QRCode from "react-qr-code"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  peerConfigToWgConfig,
  type PeerConfigWithConfiguration,
} from "@/lib/wireguard"

interface QRCodeDisplayProps {
  config: PeerConfigWithConfiguration
  size?: number
}

export function QRCodeDisplay({ config, size = 256 }: QRCodeDisplayProps) {
  const isMobile = useIsMobile()
  if (isMobile) {
    size = 200
  }

  const configString = peerConfigToWgConfig(config)

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
