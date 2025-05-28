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

export async function getPeerConfigByUserId(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, config: true },
  })

  if (!user || !user.config) {
    return null
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
      endpoint: `${env.WIREGUARD_VPN_ENDPOINT}:${env.WIREGUARD_VPN_PORT}`,
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
