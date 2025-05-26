"use client"

import QRCode from "react-qr-code"

interface QRCodeDisplayProps {
  value: string
  size?: number
}

export function QRCodeDisplay({ value, size = 256 }: QRCodeDisplayProps) {
  return (
    <div className="flex justify-center">
      <QRCode value={value} width={size} className="rounded-lg border" />
    </div>
  )
}
