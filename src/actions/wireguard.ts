"use server"

import { readFile } from "fs/promises"
import path from "path"
import { type Configuration } from "@prisma/client"
import { headers } from "next/headers"
import { z } from "zod"

import { env } from "@/env"
import { formatConfigName } from "@/lib/utils"
import {
  parsePeerConfig,
  type PeerConfigWithConfiguration,
} from "@/lib/wireguard"
import { ConfigSchema, ConfigUpdateSchema } from "@/schemas/config"
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

    // TODO: Use {{server}}/api/ping/getAllPeersIpAddress and filter on the client on user selection
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

export async function getAvailableConfigurations() {
  try {
    const requestOptions: RequestInit = {
      method: "GET",
      headers: {
        "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
      },
      redirect: "follow",
    }

    const response = await fetch(
      `${env.WIREGUARD_API_ENDPOINT}/getWireguardConfigurations`,
      requestOptions,
    )
    if (!response.ok) {
      throw new Error(
        `Failed to fetch available configurations: ${response.statusText}`,
      )
    }

    const json = await response.json()
    if (!Array.isArray(json.data)) {
      throw new Error("Unexpected response format")
    }

    return json.data.map(
      (configuration: {
        PublicKey: string
        Name: string
        Address: string
        ListenPort: string
        PrivateKey: string
      }) => ({
        id: configuration.PublicKey,
        name: configuration.Name,
        address: configuration.Address,
        listenPort: configuration.ListenPort || env.WIREGUARD_VPN_PORT,
        publicKey: configuration.PublicKey,
        privateKey: configuration.PrivateKey,
      }),
    ) as Configuration[]
  } catch (error) {
    console.error("Error fetching available configurations:", error)
    return Promise.reject({
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    })
  }
}

export async function createPeerConfig(values: z.infer<typeof ConfigSchema>) {
  try {
    const validatedData = ConfigSchema.parse(values)

    const existingConfig = await db.peerConfig.count({
      where: { userId: values.userId },
    })
    if (existingConfig > 0) {
      return {
        success: false,
        message: "A peer config already exists for this user.",
      }
    }

    const formattedName = formatConfigName(validatedData.name)

    const wireguardConfig = await addPeerConfig(
      formattedName,
      validatedData.userId,
      validatedData.configurationName,
      validatedData.ipAddress,
    )

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: validatedData.userId },
      })

      if (!user) {
        throw new Error("User not found after creation.")
      }

      const config = await tx.peerConfig.create({
        data: {
          name: formattedName,
          publicKey: wireguardConfig.publicKey,
          privateKey: wireguardConfig.privateKey,
          allowedIPs: wireguardConfig.allowedIPs,
          endpoint: wireguardConfig.endpoint,
          endpointAllowedIP: wireguardConfig.endpointAllowedIP,
          dns: wireguardConfig.dns,
          preSharedKey: wireguardConfig.preSharedKey,
          mtu: wireguardConfig.mtu,
          keepAlive: wireguardConfig.keepAlive,
          configuration: {
            create: {
              name: wireguardConfig.configuration.name,
              address: wireguardConfig.configuration.address,
              listenPort: wireguardConfig.configuration.listenPort,
              publicKey: wireguardConfig.configuration.publicKey,
              privateKey: wireguardConfig.configuration.privateKey,
            },
          },
          user: {
            connect: {
              id: validatedData.userId,
            },
          },
        },
      })

      return config
    })

    return {
      success: true,
      name: result.name,
    }
  } catch (error) {
    console.error("Error creating peer config:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }
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

    // TODO: Use {{server}}/api/ping/getAllPeersIpAddress and filter on the client on user selection
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

export async function addPeerConfig(
  name: string,
  userId: string,
  configurationName: string,
  ipAddress?: string,
) {
  try {
    const existingConfig = await db.peerConfig.findUnique({
      where: { userId },
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

    const response = await fetch(
      `${env.WIREGUARD_API_ENDPOINT}/addPeers/${configurationName}`,
      requestOptions,
    )

    if (!response.ok) {
      throw new Error(`Failed to add peer config: ${response.statusText}`)
    }

    const json = await response.json()
    const peer = Array.isArray(json.data) ? json.data[0] : json.data

    return {
      name,
      userId: userId,
      publicKey: peer.id,
      privateKey: peer.private_key,
      allowedIPs: peer.allowed_ip || ipAddress,
      endpoint: `${peer.remote_endpoint || env.WIREGUARD_VPN_ENDPOINT}:${env.WIREGUARD_VPN_PORT}`,
      endpointAllowedIP: peer.endpoint_allowed_ip,
      keepAlive: peer.keepalive || 0,
      mtu: peer.mtu || 1420,
      preSharedKey: peer.preshared_key || "",
      dns: peer.DNS,
      createdAt: new Date(),
      updatedAt: new Date(),
      configurationId: peer.configuration_id,
      configuration: {
        name: peer.configuration.Name,
        address: peer.configuration.Address,
        listenPort: peer.configuration.ListenPort || env.WIREGUARD_VPN_PORT,
        publicKey: peer.configuration.PublicKey,
        privateKey: peer.configuration.PrivateKey,
      },
    } as PeerConfigWithConfiguration
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

  const { id, name, userId, ipAddress, content } =
    ConfigUpdateSchema.parse(values)

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

  const formattedName = formatConfigName(name || existingConfig.name)

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
    },
    body: JSON.stringify({
      id: rawConfig.PublicKey || existingConfig.publicKey,
      DNS: rawConfig.DNS || existingConfig.dns,
      allowed_ip: Array.isArray(rawConfig.AllowedIPs)
        ? rawConfig.AllowedIPs
        : Array.isArray(rawConfig.AllowedIPs) && rawConfig.AllowedIPs.length > 0
          ? rawConfig.AllowedIPs
          : existingConfig.allowedIPs,
      endpoint_allowed_ip:
        rawConfig.Address || existingConfig.endpointAllowedIP,
      keepalive: rawConfig.PersistentKeepalive || existingConfig.keepAlive,
      mtu: rawConfig.MTU || existingConfig.mtu,
      name: formattedName,
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
