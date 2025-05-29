import { type AccessRequestStatus } from "@prisma/client"
import { type ReactNode } from "react"

import { env } from "@/env"

export function AccessRequestEmail(props: {
  status: AccessRequestStatus
  data: Record<string, string>
}) {
  const { status, data } = props

  let title = ""
  let body: ReactNode = null

  if (status === "PENDING") {
    title = "Access Request Status"
    body = (
      <p>
        Your request to access HHN VPN is currently pending review. We will
        notify you once a decision has been made.
      </p>
    )
  }
  if (status === "APPROVED") {
    title = "Access Request Approved"
    body = (
      <>
        <p>Your request to access HHN VPN has been approved.</p>
        <p>You can now use the VPN service.</p>
        <a href={env.NEXT_PUBLIC_URL}>Click here to access the VPN</a>
        <p>Thank you for your request.</p>
      </>
    )
  }
  if (status === "REJECTED") {
    title = "Access Request Rejected"
    body = (
      <>
        <p>Your request to access HHN VPN has been rejected.</p>
        <p>We apologize for any inconvenience this may cause.</p>
        <p>
          If you have any questions, please reach out at{" "}
          <a href={`mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`}>
            {env.NEXT_PUBLIC_CONTACT_EMAIL}
          </a>
          .
        </p>
      </>
    )
  }

  return (
    <div>
      <h1>{title}</h1>
      <p>Dear {data.name}</p>
      {body}
      <p>Best regards,</p>
      <p>HHN VPN Team</p>
      <br />
      <p>
        <strong>Request Details:</strong>
      </p>
      <p>Email: {data.email}</p>
      <p>Access Request Reason: {data.reason}</p>
    </div>
  )
}
