"use server"

import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { sendEmail } from "@/actions/email"
import { addPeerConfig, deletePeerConfig } from "@/actions/wireguard"
import { generateTemporaryPassword } from "@/lib/password"
import { FirstTimeLoginSchema } from "@/schemas/auth"
import { UserSchema } from "@/schemas/user"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export async function createNewUser(values: z.infer<typeof UserSchema>) {
  try {
    const validatedData = UserSchema.parse(values)

    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
      select: { id: true, name: true },
    })

    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists.",
      }
    }

    const tempPassword = generateTemporaryPassword()
    const hashedPassword = await hash(tempPassword, 12)

    const newUser = await auth.api.createUser({
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

    await sendEmail({
      to: validatedData.email,
      subject: "Your HHN VPN Account Credentials",
      template: "new-user",
      data: {
        email: validatedData.email,
        password: hashedPassword,
      },
    })

    const wireguardConfig = await addPeerConfig(
      validatedData.name,
      newUser.user.id,
      validatedData.ipAddress,
    )

    await db.peerConfig.create({
      data: {
        name: wireguardConfig.name,
        publicKey: wireguardConfig.publicKey,
        privateKey: wireguardConfig.privateKey,
        allowedIPs: wireguardConfig.allowedIPs,
        endpoint: wireguardConfig.endpoint,
        endpointAllowedIP: wireguardConfig.endpointAllowedIP,
        dns: wireguardConfig.dns,
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
            id: newUser.user.id,
          },
        },
      },
    })

    return {
      success: true,
      userId: newUser.user.id,
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
    const existingUser = await db.user.findUnique({
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

    if (!existingUser) {
      return {
        success: false,
        message: "User not found.",
      }
    }
    if (!existingUser.config) {
      return {
        success: false,
        message: "User has no associated WireGuard configuration.",
      }
    }

    // TODO: Not working
    const deletedConfig = await deletePeerConfig(existingUser.config.id)

    if (!deletedConfig) {
      return {
        success: false,
        message: "Failed to delete WireGuard configuration.",
      }
    }

    await db.user.delete({
      where: { id: userId },
    })

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

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        accounts: {
          select: {
            id: true,
            providerId: true,
          },
        },
      },
    })

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      }
    }

    for (const account of user.accounts) {
      await db.account.update({
        where: { id: account.id, providerId: "credential" },
        data: { password: hashedPassword },
      })
    }

    await sendEmail({
      to: user.email,
      subject: "Your HHN VPN Account Credentials",
      template: "new-user",
      data: {
        email: user.email,
        password: hashedPassword,
      },
    })

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

export async function updateUserPassword(
  values: z.infer<typeof FirstTimeLoginSchema>,
) {
  try {
    const validatedData = FirstTimeLoginSchema.parse(values)
    const hashedPassword = await hash(validatedData.password, 12)

    const user = await db.user.findUnique({
      where: {
        email: validatedData.email,
      },
      select: {
        id: true,
        accounts: {
          select: {
            id: true,
            password: true,
          },
        },
      },
    })

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      }
    }

    let passwordUpdated = false

    for (const account of user.accounts) {
      if (!account.password) {
        return {
          success: false,
          message:
            "User account does not have a password set. Please use the first-time login flow.",
        }
      }

      await db.user.update({
        where: { id: user.id },
        data: {
          isFirstLogin: false,
          accounts: {
            update: {
              where: { id: account.id },
              data: { password: hashedPassword },
            },
          },
        },
      })

      passwordUpdated = true
    }

    if (!passwordUpdated) {
      return {
        success: false,
        message: "Failed to update user password.",
      }
    }

    revalidatePath("/vpn")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating user password:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred.",
    }
  }
}
