"use server"

import { z } from "zod"

import { addPeerConfig } from "@/actions/wireguard"
import { ConfigSchema } from "@/schemas/config"
import { db } from "@/server/db"

export async function createPeerConfig(values: z.infer<typeof ConfigSchema>) {
  try {
    const validatedData = ConfigSchema.parse(values)

    const wireguardConfig = await addPeerConfig(values.name, values.ipAddress)

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: validatedData.userId },
      })

      if (!user) {
        throw new Error("User not found after creation.")
      }

      // Create peer config
      const config = await tx.peerConfig.create({
        data: {
          name: `${validatedData.name}'s Config`,
          config: JSON.stringify(wireguardConfig),
          userId: user.id,
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
