"use client"

import { CheckCircle, Copy, CopyCheck, Download } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  peerConfigToWgConfig,
  type PeerConfigWithConfiguration,
} from "@/lib/wireguard"

export function DetailsCardButtons({
  config,
}: {
  config: PeerConfigWithConfiguration
}) {
  const [state, setState] = useState({
    error: {
      download: "",
      copy: "",
    },
    downloading: false,
    copied: false,
  })

  const configString = peerConfigToWgConfig(config)

  const downloadConfig = () => {
    try {
      setState((prev) => ({ ...prev, downloading: true }))

      const blob = new Blob([configString], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")

      a.href = url
      a.download = "vpn.famlam.ca.conf"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Configuration downloaded successfully", {
        description: "Your WireGuard configuration file has been downloaded.",
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        downloading: false,
        error: { ...prev.error, download: String(err) },
      }))
      toast.error("Failed to download configuration", {
        description: "Please try again.",
      })
    }
    setTimeout(() => {
      setState((prev) => ({ ...prev, downloading: false }))
    }, 3000)
  }

  const copyConfig = () => {
    navigator.clipboard
      .writeText(configString)
      .then(() => {
        setState((prev) => ({ ...prev, copied: true }))
        toast.success("Configuration copied to clipboard", {
          description: "You can now paste it into your WireGuard app.",
        })
      })
      .catch((err) => {
        setState((prev) => ({ ...prev, error: { ...prev.error, copy: err } }))
        console.error("Failed to copy configuration: ", err)
        toast.error("Failed to copy configuration", {
          description: "Please try again or copy manually.",
        })
      })
    setTimeout(() => {
      setState((prev) => ({ ...prev, copied: false }))
    }, 3000)
  }

  return (
    <>
      <div className="space-y-2 pt-4">
        <Button
          disabled={state.downloading}
          onClick={downloadConfig}
          variant="outline"
          className="w-full"
        >
          {state.downloading ? (
            <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Download className="size-4" />
          )}
          Download Config File
        </Button>
        <Button
          disabled={state.copied}
          onClick={copyConfig}
          variant="outline"
          className="w-full"
        >
          {state.copied ? (
            <CopyCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="size-4" />
          )}
          Copy Configuration
        </Button>
      </div>
    </>
  )
}
