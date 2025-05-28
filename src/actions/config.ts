"use server"

import { z } from "zod"

import { addPeerConfig } from "@/actions/wireguard"
import { ConfigSchema } from "@/schemas/config"
import { db } from "@/server/db"

export async function createPeerConfig(values: z.infer<typeof ConfigSchema>) {
  try {
    const validatedData = ConfigSchema.parse(values)

    const wireguardConfigArr = await addPeerConfig(
      values.name,
      values.ipAddress,
    )
    const wireguardConfig = wireguardConfigArr[0]
    console.log("WireGuard config created:", wireguardConfig)

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: validatedData.userId },
      })

      if (!user) {
        throw new Error("User not found after creation.")
      }

      const config = await tx.peerConfig.create({
        data: {
          name: validatedData.name,
          publicKey: wireguardConfig.id,
          privateKey: wireguardConfig.private_key,
          allowedIPs: wireguardConfig.allowed_ip,
          endpoint: wireguardConfig.remote_endpoint,
          endpointAllowedIP: wireguardConfig.endpoint_allowed_ip,
          dns: wireguardConfig.DNS,
          preSharedKey: wireguardConfig.preshared_key,
          mtu: wireguardConfig.mtu,
          keepAlive: wireguardConfig.keepalive,
          configuration: {
            create: {
              name: wireguardConfig.configuration.Name,
              address: wireguardConfig.configuration.Address,
              connectedPeers: wireguardConfig.configuration.ConnectedPeers,
              listenPort: wireguardConfig.configuration.ListenPort,
              publicKey: wireguardConfig.configuration.PublicKey,
              privateKey: wireguardConfig.configuration.PrivateKey,
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
