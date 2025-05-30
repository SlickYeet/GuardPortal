"use server"

import { z } from "zod"

import { addPeerConfig } from "@/actions/wireguard"
import { env } from "@/env"
import { ConfigSchema } from "@/schemas/config"
import { db } from "@/server/db"

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

    const formattedName =
      env.NODE_ENV === "production"
        ? `prod:${values.name}'s Config`
        : `dev:${values.name}'s Config`

    const wireguardConfig = await addPeerConfig(
      formattedName,
      validatedData.userId,
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
