"use server"

import { env } from "@/env"

if (env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
}

export async function getPeerConfig({ peerId }: { peerId?: string } = {}) {
  const defaultPeerId = "1oS/wdQvRS6cCigcbbc6rQ4VLWVSJbKN0/ZcmOTOTT0="

  const requestOptions: RequestInit = {
    method: "GET",
    headers: {
      "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
    },
    redirect: "follow",
  }

  const response = await fetch(
    `${env.WIREGUARD_API_ENDPOINT}/downloadPeer/wg0?id=${encodeURIComponent(
      peerId || defaultPeerId,
    )}`,
    requestOptions,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch peer config: ${response.statusText}`)
  }

  const json = await response.json()
  return {
    config: json.data.file,
    fileName: json.data.fileName,
  }
}
