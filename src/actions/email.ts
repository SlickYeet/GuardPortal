"use server"

import { headers } from "next/headers"

import { emailRenderer, type EmailTemplates } from "@/components/email-renderer"
import { rateLimiter } from "@/lib/ratelimit"
import { resend } from "@/lib/resend"

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
