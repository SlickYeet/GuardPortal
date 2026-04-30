"use client"

import { QrCodeIcon } from "lucide-react"
import QRCode from "react-qr-code"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FALLBACK_QR_URL } from "@/constants"
import { QRCodeDisplay } from "@/modules/dashboard/ui/qr-code-display"
import type { PeerConfig } from "@/server/db/schema"

interface QRCodeModalProps {
  peerConfig: PeerConfig | null
}

export function QRCodeModal({ peerConfig }: QRCodeModalProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            className="inline-flex w-full md:hidden"
            size="lg"
            variant="secondary"
          />
        }
      >
        <QrCodeIcon /> View QR Code
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code with your WireGuard app to import the
            configuration
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  )
}
