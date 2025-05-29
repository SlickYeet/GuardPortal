"use server"

import { hash } from "bcryptjs"
import { z } from "zod"

import { addPeerConfig, deletePeerConfig } from "@/actions/wireguard"
import { generateTemporaryPassword } from "@/lib/password"
import { UserSchema } from "@/schemas/user"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export async function createNewUser(values: z.infer<typeof UserSchema>) {
  try {
    const validatedData = UserSchema.parse(values)

    const existingUsers = await db.user.count({
      where: { email: validatedData.email },
    })

    if (existingUsers > 0) {
      return {
        success: false,
        message: "User with this email already exists.",
      }
    }

    const tempPassword = generateTemporaryPassword()
    const hashedPassword = await hash(tempPassword, 12)

    const wireguardConfig = await addPeerConfig(
      validatedData.name,
      validatedData.ipAddress,
    )

    const newUser = await auth.api.signUpEmail({
      body: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    })

    if (!newUser) {
      return {
        success: false,
        message: "Failed to create user.",
      }
    }

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email: validatedData.email },
      })

      if (!user) {
        throw new Error("User not found after creation.")
      }

      await tx.peerConfig.create({
        data: {
          ...wireguardConfig,
          name: validatedData.name,
          userId: user.id,
        },
      })

      return user
    })

    return {
      success: true,
      userId: result.id,
      tempPassword,
    }
  } catch (error) {
    console.error("Error creating new user:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred.",
    }
  }
}

export async function getUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        config: {
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!users || users.length === 0) {
      return null
    }

    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred.",
    )
  }
}

export async function deleteUser(userId: string) {
  try {
    const deletedUser = await db.user.delete({
      where: { id: userId },
      select: {
        id: true,
        config: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!deletedUser) {
      return {
        success: false,
        message: "User not found.",
      }
    }
    if (!deletedUser.config) {
      return {
        success: false,
        message: "User has no associated WireGuard configuration.",
      }
    }

    const deletedConfig = await deletePeerConfig(deletedUser.config.id)

    if (!deletedConfig) {
      return {
        success: false,
        message: "Failed to delete WireGuard configuration.",
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred.",
    }
  }
}

export async function resetUserPassword(userId: string) {
  try {
    const tempPassword = generateTemporaryPassword()
    const hashedPassword = await hash(tempPassword, 12)

    const accounts = await db.account.findMany({
      where: { userId },
      select: { id: true },
    })

    for (const account of accounts) {
      await db.account.update({
        where: { id: account.id, providerId: "credential" },
        data: { password: hashedPassword },
      })
    }

    return {
      success: true,
      tempPassword,
    }
  } catch (error) {
    console.error("Error resetting user password:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred.",
    }
  }
}
