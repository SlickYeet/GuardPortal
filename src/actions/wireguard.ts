"use server"

import { readFile } from "fs/promises"
import path from "path"

import { env } from "@/env"
import { db } from "@/server/db"

if (env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
}

export async function getDefaultPeerConfig() {
  const filePath = path.join(
    process.cwd(),
    "src",
    "config",
    "default-peer-config.conf",
  )
  return await readFile(filePath, "utf-8")
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
    config: json.data.file as string,
    fileName: json.data.fileName as string,
  }
}

export async function getPeerConfigByUserId(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, config: true },
  })

  if (!user || (!user.config && env.ADMIN_EMAIL !== user.email)) {
    throw new Error(`No peer config found for user with ID: ${userId}`)
  } else if (env.ADMIN_EMAIL === user.email) {
    const defaultConfig = await getPeerConfig()

    const config = {
      config: defaultConfig.config,
      name: defaultConfig.fileName,
    }

    return config
  }

  return user.config
}

export async function getAvailablePeerIPs() {
  const requestOptions: RequestInit = {
    method: "GET",
    headers: {
      "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
    },
    redirect: "follow",
  }

  const response = await fetch(
    `${env.WIREGUARD_API_ENDPOINT}/getAvailableIPs/wg0`,
    requestOptions,
  )

  if (!response.ok) {
    throw new Error(
      `Failed to fetch available peer IPs: ${response.statusText}`,
    )
  }

  const json = await response.json()
  return json.data
}

export async function addPeerConfig(name: string, ipAddress?: string) {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
    },
    body: JSON.stringify({
      name: `${name}'s Config`,
      ...(ipAddress ? { allowed_ips: [ipAddress] } : {}),
    }),
  }

  const response = await fetch(
    `${env.WIREGUARD_API_ENDPOINT}/addPeers/wg0`,
    requestOptions,
  )

  if (!response.ok) {
    throw new Error(`Failed to add peer config: ${response.statusText}`)
  }

  const json = await response.json()
  return json.data
}
