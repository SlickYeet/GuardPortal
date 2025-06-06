"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { sendEmail } from "@/actions/email"
import { addPeerConfig, deletePeerConfig } from "@/actions/wireguard"
import { env } from "@/env"
import { generateTemporaryPassword } from "@/lib/password"
import { FirstTimeLoginSchema, SignUpSchema } from "@/schemas/auth"
import {
  DeleteUserSchema,
  ResetUserPasswordSchema,
  UserSchema,
} from "@/schemas/user"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export async function createFirstUserAsAdmin(
  values: z.infer<typeof SignUpSchema>,
) {
  const name = values.name || env.ADMIN_NAME
  const email = values.email || env.ADMIN_EMAIL
  const password = values.password || env.ADMIN_PASSWORD

  const res = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
    asResponse: true,
  })

  if (!res.ok) {
    const errorMessage = await res.text()
    console.error("Error creating first user:", errorMessage)
    return {
      success: false,
      message: errorMessage,
    }
  }

  await db.user.update({
    where: { email },
    data: {
      emailVerified: true,
      isFirstLogin: false,
      role: "admin",
    },
  })

  revalidatePath("/vpn")
  return redirect("/vpn")
}

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

    const newUser = await auth.api.createUser({
      body: {
        name: validatedData.name,
        email: validatedData.email,
        password: tempPassword,
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
        password: tempPassword,
      },
    })

    const wireguardConfig = await addPeerConfig(
      validatedData.name,
      newUser.user.id,
      validatedData.configurationName,
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
        emailVerified: true,
        isFirstLogin: true,
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

export async function deleteUser(values: z.infer<typeof DeleteUserSchema>) {
  try {
    const existingUser = await db.user.findUnique({
      where: { id: values.userId },
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

    const deletedConfig = await deletePeerConfig(existingUser.config.id)

    if (!deletedConfig) {
      return {
        success: false,
        message: "Failed to delete WireGuard configuration.",
      }
    }

    await db.user.delete({
      where: { id: values.userId },
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

export async function resetUserPassword(
  values: z.infer<typeof ResetUserPasswordSchema>,
) {
  try {
    const ctx = await auth.$context
    const tempPassword = generateTemporaryPassword()
    const hashedPassword = await ctx.password.hash(tempPassword)

    const user = await db.user.findUnique({
      where: { id: values.userId },
      select: {
        email: true,
        accounts: {
          select: {
            id: true,
            providerId: true,
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

    const credentialAccounts = user.accounts.filter(
      (account) => account.providerId === "credential",
    )

    if (credentialAccounts.length === 0) {
      return {
        success: false,
        message: "No credential-based account found for the user.",
      }
    }

    for (const account of credentialAccounts) {
      await db.account.update({
        where: { id: account.id },
        data: { password: hashedPassword },
      })
    }

    await db.user.update({
      where: { id: values.userId },
      data: {
        isFirstLogin: true,
      },
    })

    await sendEmail({
      to: user.email,
      subject: "Your HHN VPN Account Credentials",
      template: "new-user",
      data: {
        email: user.email,
        password: tempPassword,
      },
    })

    return {
      success: true,
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

export async function updateUserPasswordAndVerifyEmail(
  values: z.infer<typeof FirstTimeLoginSchema>,
) {
  try {
    const ctx = await auth.$context
    const validatedData = FirstTimeLoginSchema.parse(values)
    const hashedPassword = await ctx.password.hash(validatedData.password)

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
          emailVerified: true,
          isFirstLogin: false,
          accounts: {
            update: {
              where: {
                id: account.id,
              },
              data: {
                password: hashedPassword,
              },
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
