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
  key?: string
  data?: Record<string, string>
}> {
  try {
    const ip = ((await headers()).get("x-forwarded-for") ?? "127.0.0.1")
      .split(",")[0]
      .trim()
    const { success, remaining, limit, reset } = await rateLimiter({
      ip,
      limit: 2,
      window: 60 * 1000 * 5, // 5 minutes
    })
    if (!success) {
      const waitMs = reset ? reset - Date.now() : 5 * 60 * 1000
      const waitSeconds = Math.ceil(waitMs / 1000)
      const waitMinutes = Math.floor(waitSeconds / 60)
      const waitRemainderSeconds = waitSeconds % 60
      return {
        success: false,
        message: `You have reached the maximum of ${limit} request(s). Please wait ${waitMinutes} minute(s)${waitRemainderSeconds ? ` and ${waitRemainderSeconds} seconds` : ""} before trying again. You have ${remaining} request(s) remaining in this period.`,
      }
    }

    const existingAccessRequest = await db.accessRequest.count({
      where: { email: values.email },
    })

    if (existingAccessRequest > 0) {
      return {
        success: false,
        message: "An access request for this email already exists.",
        key: "EMAIL_EXISTS",
      }
    }

    const existingUser = await db.user.count({
      where: { email: values.email },
    })

    if (existingUser > 0) {
      return {
        success: false,
        message: "An account with this email already exists.",
        key: "EMAIL_EXISTS",
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
    if (existingRequest.status === values.status) {
      return existingRequest
    }

    const updatedRequest = await db.accessRequest.update({
      where: { id: values.id },
      data: { status: values.status },
    })
    if (!updatedRequest) {
      throw new Error("Access request not found")
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
