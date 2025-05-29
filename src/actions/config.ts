"use server"

import { z } from "zod"

import { addPeerConfig } from "@/actions/wireguard"
import { ConfigSchema } from "@/schemas/config"
import { db } from "@/server/db"

export async function createPeerConfig(values: z.infer<typeof ConfigSchema>) {
  try {
    const validatedData = ConfigSchema.parse(values)

    const wireguardConfig = await addPeerConfig(
      values.name,
      values.userId,
      values.ipAddress,
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
          name: validatedData.name,
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
