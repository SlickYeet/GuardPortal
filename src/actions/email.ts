"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { emailRenderer, type EmailTemplates } from "@/components/emer-renderer"
import { rateLimiter } from "@/lib/ratelimit"
import { resend } from "@/lib/resend"
import { RequestAccessSchema } from "@/schemas/request-access"
import { db } from "@/server/db"

type ReturnType = {
  success: boolean
  message?: string
  data?: Record<string, string>
}

interface sendEmailProps {
  to: string | string[]
  subject: string
  template: EmailTemplates
  data: Record<string, string>
}

export async function sendEmail({
  to,
  subject,
  template,
  data,
}: sendEmailProps): Promise<void> {
  const ip = ((await headers()).get("x-forwarded-for") ?? "127.0.0.1")
    .split(",")[0]
    .trim()
  const { success, remaining } = await rateLimiter({ ip, limit: 5 })
  if (!success) {
    throw new Error(
      `Rate limit exceeded. Try again in ${Math.ceil(
        remaining / 1000,
      )} seconds.`,
    )
  }

  const html = await emailRenderer({ template, data })

  if (html === null) {
    throw new Error("Failed to render email template.")
  }

  await resend.emails.send({
    from: "HHN VPN <vpn@famlam.ca>",
    to: to,
    subject,
    html,
  })
}

export async function requestAccessEmail(
  values: z.infer<typeof RequestAccessSchema>,
): Promise<ReturnType> {
  try {
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
      },
    })

    if (!accessRequest) {
      return {
        success: false,
        message: "Failed to create access request.",
      }
    }

    await sendEmail({
      to: accessRequest.email,
      subject: "HHN VPN Access Request",
      template: "request-access",
      data: {
        name: accessRequest.name,
        email: accessRequest.email,
        reason: accessRequest.reason ?? "No reason provided",
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
