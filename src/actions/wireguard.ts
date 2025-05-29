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

    // TODO: Require interface to be passed in
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

    // TODO: Require interface to be passed in
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
    const existingConfig = await db.peerConfig.findFirst({
      where: { name, allowedIPs: ipAddress || undefined },
      select: {
        id: true,
        configuration: {
          select: {
            name: true,
          },
        },
      },
    })

    if (existingConfig) {
      throw new Error(
        `A peer config with the name "${name}" and IP "${ipAddress}" already exists.`,
      )
    }

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

    // TODO: Add interface to add peer form
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

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
    },
    body: JSON.stringify({
      peers: [configToDelete.publicKey],
    }),
  }

  const response = await fetch(
    `${env.WIREGUARD_API_ENDPOINT}/deletePeers/${configToDelete.configuration.name}`,
    requestOptions,
  )

  if (!response.ok) {
    throw new Error(`Failed to delete peer config: ${response.statusText}`)
  }

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

  const existingConfig = await db.peerConfig.findUnique({
    where: { id, userId: userId || undefined },
    select: {
      name: true,
      publicKey: true,
      dns: true,
      allowedIPs: true,
      endpointAllowedIP: true,
      keepAlive: true,
      mtu: true,
      privateKey: true,
      endpoint: true,
      preSharedKey: true,
      configuration: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!existingConfig) {
    throw new Error("Peer config not found")
  }

  const parseContent = z.string().parse(content)
  const rawConfig = parsePeerConfig(parseContent)

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
    },
    body: JSON.stringify({
      id: rawConfig.PublicKey || existingConfig.publicKey,
      DNS: rawConfig.DNS || existingConfig.dns,
      allowed_ips: Array.isArray(rawConfig.AllowedIPs)
        ? rawConfig.AllowedIPs
        : Array.isArray(rawConfig.AllowedIPs) && rawConfig.AllowedIPs.length > 0
          ? rawConfig.AllowedIPs
          : existingConfig.allowedIPs,
      endpoint_allowed_ip:
        rawConfig.Address || existingConfig.endpointAllowedIP,
      keepalive: rawConfig.PersistentKeepalive || existingConfig.keepAlive,
      mtu: rawConfig.MTU || existingConfig.mtu,
      name: name || rawConfig.Name || existingConfig.name,
      private_key: rawConfig.PrivateKey || existingConfig.privateKey,
      remote_endpoint:
        rawConfig.Endpoint ||
        existingConfig.endpoint ||
        `${env.WIREGUARD_VPN_ENDPOINT}:${env.WIREGUARD_VPN_PORT}`,
      preshared_key: rawConfig.PresharedKey || existingConfig.preSharedKey,
    }),
  }

  const response = await fetch(
    `${env.WIREGUARD_API_ENDPOINT}/updatePeerSettings/${existingConfig.configuration.name}`,
    requestOptions,
  )

  if (!response.ok) {
    throw new Error(`Failed to update peer config: ${response.statusText}`)
  }

  const updatedConfig = await db.peerConfig.update({
    where: { id, userId: userId || undefined },
    data: {
      publicKey: rawConfig.PublicKey || existingConfig.publicKey,
      dns: rawConfig.DNS || existingConfig.dns,
      allowedIPs:
        ipAddress !== undefined
          ? ipAddress
          : Array.isArray(rawConfig.AllowedIPs)
            ? rawConfig.AllowedIPs.join(", ")
            : rawConfig.AllowedIPs || existingConfig.allowedIPs,
      endpointAllowedIP: rawConfig.Address || existingConfig.endpointAllowedIP,
      keepAlive: rawConfig.PersistentKeepalive || existingConfig.keepAlive,
      mtu: rawConfig.MTU || existingConfig.mtu,
      name: name || rawConfig.Name || existingConfig.name,
      privateKey: rawConfig.PrivateKey || existingConfig.privateKey,
      endpoint:
        rawConfig.Endpoint ||
        existingConfig.endpoint ||
        `${env.WIREGUARD_VPN_ENDPOINT}:${env.WIREGUARD_VPN_PORT}`,
      preSharedKey: rawConfig.PresharedKey || existingConfig.preSharedKey,
      userId: userId ? userId : currentUserId,
    },
  })

  if (!updatedConfig) {
    throw new Error("Failed to update peer config in the database")
  }

  return updatedConfig
}
