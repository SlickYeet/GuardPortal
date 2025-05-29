"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { sendEmail } from "@/actions/email"
import { env } from "@/env"
import { rateLimiter } from "@/lib/ratelimit"
import {
  RequestAccessSchema,
  UpdateAccessRequestSchema,
} from "@/schemas/request-access"
import { db } from "@/server/db"

export async function createRequestAccess(
  values: z.infer<typeof RequestAccessSchema>,
): Promise<{
  success: boolean
  message?: string
  data?: Record<string, string>
}> {
  try {
    const ip = ((await headers()).get("x-forwarded-for") ?? "127.0.0.1")
      .split(",")[0]
      .trim()
    const { success, remaining } = await rateLimiter({
      ip,
      limit: 1,
      duration: 60 * 1000 * 5, // 5 minutes
    })
    if (!success) {
      return {
        success: false,
        message: `Rate limit exceeded. Try again in ${Math.ceil(
          remaining / 1000,
        )} seconds.`,
      }
    }

    const existingAccessRequest = await db.accessRequest.count({
      where: { email: values.email },
    })

    if (existingAccessRequest > 0) {
      return {
        success: false,
        message: "An access request for this email already exists.",
      }
    }

    const existingUser = await db.user.count({
      where: { email: values.email },
    })

    if (existingUser > 0) {
      return {
        success: false,
        message: "An account with this email already exists.",
      }
    }

    const accessRequest = await db.accessRequest.create({
      data: values,
      select: {
        name: true,
        email: true,
        reason: true,
        status: true,
      },
    })

    if (!accessRequest) {
      return {
        success: false,
        message: "Failed to create access request.",
      }
    }

    await sendEmail({
      to: env.ADMIN_EMAIL,
      subject: "HHN VPN Access Request",
      template: "request-access",
      data: {
        name: accessRequest.name,
        email: accessRequest.email,
        reason: accessRequest.reason ?? "No reason provided",
      },
    })
    await sendEmail({
      to: accessRequest.email,
      subject: "HHN VPN Access Request Received",
      template: "access-request-pending",
      data: {
        name: accessRequest.name,
        email: accessRequest.email,
        reason: accessRequest.reason ?? "No reason provided",
        status: accessRequest.status,
      },
    })

    return {
      success: true,
      message: "Access request email sent successfully.",
      data: {
        email: accessRequest.email,
      },
    }
  } catch (error) {
    console.error("Error sending request access email:", error)
    return {
      success: false,
      message: "An error occurred while processing your request.",
    }
  }
}

export async function getAccessRequests() {
  try {
    const accessRequest = await db.accessRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!accessRequest || accessRequest.length === 0) {
      return []
    }

    return accessRequest
  } catch (error) {
    console.error("Failed to get access requests:", error)
    throw new Error(
      `Failed to get access requests: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    )
  }
}

export async function updateAccessRequest(
  values: z.infer<typeof UpdateAccessRequestSchema>,
) {
  try {
    const existingRequest = await db.accessRequest.findUnique({
      where: { id: values.id },
    })
    if (!existingRequest) {
      throw new Error("Access request not found")
    }

    const updatedRequest = await db.accessRequest.update({
      where: { id: values.id },
      data: { status: values.status },
      select: {
        name: true,
        email: true,
        reason: true,
        status: true,
      },
    })

    if (!updatedRequest) {
      throw new Error("Access request not found")
    }

    if (updatedRequest.status === values.status) {
      return updatedRequest
    }

    const templateName =
      updatedRequest.status.toUpperCase() === "APPROVED"
        ? "access-request-approved"
        : "access-request-rejected"

    await sendEmail({
      to: updatedRequest.email,
      subject: `Your HHN VPN Access Request Status: ${updatedRequest.status.toLowerCase()}`,
      template: templateName,
      data: {
        name: updatedRequest.name,
        email: updatedRequest.email,
        reason: updatedRequest.reason ?? "No reason provided",
        status: updatedRequest.status,
      },
    })

    return updatedRequest
  } catch (error) {
    console.error("Failed to change access request status:", error)
    throw new Error(
      `Failed to change access request status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    )
  }
}

export async function deleteAccessRequest(requestId: string) {
  try {
    const existingRequest = await db.accessRequest.findUnique({
      where: { id: requestId },
    })

    if (!existingRequest) {
      throw new Error("Access request not found")
    }

    await db.accessRequest.delete({
      where: { id: requestId },
    })

    return true
  } catch (error) {
    console.error("Failed to delete access request:", error)
    throw new Error(
      `Failed to delete access request: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    )
  }
}
