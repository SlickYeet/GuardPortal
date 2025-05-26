"use client"

import QRCode from "react-qr-code"

import { useIsMobile } from "@/hooks/use-mobile"

interface QRCodeDisplayProps {
  value: string
  size?: number
}

export function QRCodeDisplay({ value, size = 256 }: QRCodeDisplayProps) {
  const isMobile = useIsMobile()
  if (isMobile) {
    size = 200
  }

  return (
    <div className="flex justify-center">
      <QRCode
        value={value}
        size={size}
        bgColor="#18181b"
        fgColor="#fafafa"
        className="rounded-lg border"
      />
    </div>
  )
}
