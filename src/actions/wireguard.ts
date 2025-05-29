"use server"

import { readFile } from "fs/promises"
import path from "path"
import { headers } from "next/headers"
import { z } from "zod"

import { env } from "@/env"
import { parsePeerConfig } from "@/lib/wireguard"
import { ConfigUpdateSchema } from "@/schemas/config"
import { auth } from "@/server/auth"
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
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred",
    )
  }
}

export async function getPeerConfigById(id: string) {
  try {
    const peerConfig = await db.peerConfig.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        allowedIPs: true,
        endpoint: true,
        dns: true,
        mtu: true,
        keepAlive: true,
        publicKey: true,
        privateKey: true,
        endpointAllowedIP: true,
        configuration: {
          select: {
            id: true,
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

    if (!peerConfig) {
      return null
    }

    return peerConfig
  } catch (error) {
    console.error("Error fetching peer config by ID:", error)
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred",
    )
  }
}

export async function getPeerConfigByUserId(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        config: {
          include: {
            configuration: true,
          },
        },
      },
    })

    if (!user || !user.config) {
      return null
    }
    ;``

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
        name,
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
    select: {
      name: true,
      publicKey: true,
      configuration: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!configToDelete) {
    throw new Error("Peer config not found")
  }

  // const aLongLongTimeAgo = "2000-01-01 00:00:00"

  // const jobPayload = {
  //   Job: {
  //     JobID: `delete-peer-${configToDelete.name}:${id}`,
  //     Configuration: configToDelete.configuration.name,
  //     Peer: configToDelete.publicKey,
  //     Field: "date",
  //     Operator: "lgt",
  //     Value: aLongLongTimeAgo,
  //     CreationDate: "",
  //     ExpireDate: "",
  //     Action: "delete",
  //   },
  // }

  // const requestOptions: RequestInit = {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
  //   },
  //   body: JSON.stringify(jobPayload),
  // }

  // const response = await fetch(
  //   `${env.WIREGUARD_API_ENDPOINT}/savePeerScheduleJob`,
  //   requestOptions,
  // )

  // if (!response.ok) {
  //   throw new Error(`Failed to delete peer config: ${response.statusText}`)
  // }

  await db.peerConfig.delete({
    where: { id },
  })
  await db.configuration.delete({
    where: { id: configToDelete.configuration.id },
  })

  return {
    success: true,
    message: "Peer config deleted successfully",
  }
}

export async function updatePeerConfig(
  values: Partial<z.infer<typeof ConfigUpdateSchema>>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const currentUserId = session?.user.id

  const { id, name, userId, ipAddress, content } = values

  if (!id || !userId || !currentUserId) {
    throw new Error("The config ID and userId must be provided to update")
  }

  const parseContent = z.string().parse(content)
  const rawConfig = parsePeerConfig(parseContent)

  const updatedConfig = await db.peerConfig.update({
    where: { id, userId: userId || undefined },
    data: {
      name: name || undefined,
      userId: userId ? userId : currentUserId,
      allowedIPs:
        ipAddress !== undefined
          ? ipAddress
          : Array.isArray(rawConfig.AllowedIPs)
            ? rawConfig.AllowedIPs.join(", ")
            : rawConfig.AllowedIPs || undefined,
      dns: rawConfig.DNS || undefined,
      mtu: rawConfig.MTU || undefined,
      keepAlive: rawConfig.PersistentKeepalive || undefined,
      endpoint:
        rawConfig.Endpoint ||
        `${env.WIREGUARD_VPN_ENDPOINT}:${env.WIREGUARD_VPN_PORT}` ||
        undefined,
      publicKey: rawConfig.PublicKey || undefined,
      privateKey: rawConfig.PrivateKey || undefined,
      endpointAllowedIP: rawConfig.Address || undefined,
    },
  })

  return updatedConfig
}
