"use server"

import { readFile } from "fs/promises"
import path from "path"
import { PeerConfig } from "@prisma/client"

import { env } from "@/env"
import { db } from "@/server/db"

export async function getDefaultPeerConfig() {
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "config",
      "placeholder-peer-config.conf",
    )
    const config = await readFile(filePath, "utf-8")
    return config
  } catch (error) {
    console.error("Error reading default peer config file:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getPeerConfigByUserId(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, config: true },
    })

    if (!user || !user.config) {
      return null
    }

    return user.config
  } catch (error) {
    console.error("Error fetching peer config by user ID:", error)
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred",
    )
  }
}

export async function getAvailablePeerIPs() {
  try {
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
  } catch (error) {
    console.error("Error fetching available peer IPs:", error)
    return Promise.reject({
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    })
  }
}

export async function getPeerConfigs() {
  try {
    const requestOptions: RequestInit = {
      method: "GET",
      headers: {
        "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
      },
      redirect: "follow",
    }

    const response = await fetch(
      `${env.WIREGUARD_API_ENDPOINT}/downloadAllPeers/wg0`,
      requestOptions,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch peer configs: ${response.statusText}`)
    }

    const json = await response.json()
    return json.data.map((peer: { file: string; fileName: string }) => ({
      name: peer.fileName,
      config: peer.file,
    }))
  } catch (error) {
    console.error("Error fetching peer configs:", error)
    return Promise.reject({
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    })
  }
}

export async function getPeerConfigsFromDB() {
  try {
    const peerConfigs = await db.peerConfig.findMany({
      select: {
        id: true,
        name: true,
        allowedIPs: true,
        endpoint: true,
        dns: true,
        configuration: {
          select: {
            name: true,
            address: true,
            listenPort: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!peerConfigs) {
      return null
    }

    return peerConfigs
  } catch (error) {
    console.error("Error fetching peer configs from DB:", error)

    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred",
    )
  }
}

export async function addPeerConfig(name: string, ipAddress?: string) {
  try {
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
  } catch (error) {
    console.error("Error adding peer config:", error)
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred",
    )
  }
}

export async function deletePeerConfig(id: string) {
  const configToDelete = await db.peerConfig.findUnique({
    where: { id },
  })

  if (!configToDelete) {
    throw new Error("Peer config not found")
  }

  const jobPayload = {
    job: {
      JobID: `delete-peer-${id}`,
      Configuration: "",
      Peer: "",
      Field: "total_data",
      Operator: "lgt",
      Value: "0",
      CreationDate: "",
      ExpireDate: "",
      Action: "delete",
    },
  }

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
    },
    body: JSON.stringify(jobPayload),
  }

  const response = await fetch(
    `${env.WIREGUARD_API_ENDPOINT}/savePeerScheduleJob`,
    requestOptions,
  )

  if (!response.ok) {
    throw new Error(`Failed to delete peer config: ${response.statusText}`)
  }

  await db.peerConfig.delete({
    where: { id },
  })

  return {
    success: true,
    message: "Peer config deleted successfully",
  }
}
