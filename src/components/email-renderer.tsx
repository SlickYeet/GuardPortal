import { AccessRequestStatus } from "@prisma/client"
import { render } from "@react-email/components"

import { AccessRequestEmail } from "@/components/emails/access-request"
import { env } from "@/env"

export type EmailTemplates =
  | "new-user"
  | "request-access"
  | "access-request-pending"
  | "access-request-approved"
  | "access-request-rejected"

const emails: Record<
  EmailTemplates,
  React.ComponentType<{ data: Record<string, string> }>
> = {
  "new-user": (props) => {
    const { data } = props
    return (
      <div>
        <h1>Welcome to HHN VPN</h1>
        <p>Email: {data.email}</p>
        <p>Password: {data.password}</p>
        <p>Your account has been created successfully!</p>
        <p>
          Click
          <a href={env.NEXT_PUBLIC_URL}> here </a>
          to log in to your account
        </p>
      </div>
    )
  },
  "request-access": (props) => {
    const { data } = props
    return (
      <div>
        <h1>Request Access</h1>
        <p>Name: {data.name}</p>
        <p>Email: {data.email}</p>
        <p>Reason: {data.reason}</p>
      </div>
    )
  },
  "access-request-pending": (props) => (
    <AccessRequestEmail
      status={AccessRequestStatus.PENDING}
      data={props.data}
    />
  ),
  "access-request-approved": (props) => (
    <AccessRequestEmail
      status={AccessRequestStatus.APPROVED}
      data={props.data}
    />
  ),
  "access-request-rejected": (props) => (
    <AccessRequestEmail
      status={AccessRequestStatus.REJECTED}
      data={props.data}
    />
  ),
}

export async function emailRenderer({
  template,
  data,
}: {
  template: EmailTemplates
  data: Record<string, string>
}): Promise<string> {
  const EmailComponent = emails[template]
  return render(<EmailComponent data={data} />)
}
