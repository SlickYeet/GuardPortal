"use client"

import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { peerConfigToWGConfig } from "@/helpers/peer-config-to-wg-config"
import type { PeerConfig } from "@/server/db/schema"

interface PeerConfigDownloadButtonsProps {
  peerConfig: PeerConfig
}

export function PeerConfigDownloadButtons({
  peerConfig,
}: PeerConfigDownloadButtonsProps) {
  const [state, setState] = React.useState({
    copied: false,
    downloading: false,
    error: {
      copy: "",
      download: "",
    },
  })

  const peerConfigString = peerConfigToWGConfig(peerConfig)

  function handleDownload() {
    try {
      setState((prev) => ({
        ...prev,
        downloading: true,
      }))

      const blob = new Blob([peerConfigString], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")

      a.href = url
      a.download = "vpn.famlam.ca.conf"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Config file downloaded!")
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          downloading: false,
        }))
      }, 3000)
    } catch (error) {
      console.error("Failed to download config file: ", error)
      setState((prev) => ({
        ...prev,
        downloading: false,
        error: {
          ...prev.error,
          download: String(error),
        },
      }))
      toast.error("Failed to download config file. Please try again.")
    }
  }

  function handleCopy() {
    try {
      navigator.clipboard.writeText(peerConfigString)
      setState((prev) => ({
        ...prev,
        copied: true,
      }))
      toast.success("Configuration copied to clipboard!")
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          copied: false,
        }))
      }, 3000)
    } catch (error) {
      console.error("Failed to copy configuration: ", error)
      setState((prev) => ({
        ...prev,
        error: {
          ...prev.error,
          copy: String(error),
        },
      }))
      toast.error("Failed to copy configuration. Please try again.")
    }
  }

  return (
    <div className="space-y-2 pt-4">
      <Button
        className="w-full"
        disabled={state.downloading}
        onClick={handleDownload}
        variant="outline"
      >
        {state.downloading ? (
          <CheckIcon className="text-green-600 dark:text-green-400" />
        ) : (
          <DownloadIcon />
        )}
        Download Config File
      </Button>
      <Button
        className="w-full"
        disabled={state.copied}
        onClick={handleCopy}
        variant="outline"
      >
        {state.copied ? (
          <CheckIcon className="text-green-600 dark:text-green-400" />
        ) : (
          <CopyIcon />
        )}
        Copy Configuration
      </Button>
    </div>
  )
}
