import { AccessRequestStatus } from "@prisma/client"
import { render } from "@react-email/components"

import { AccessRequestEmail } from "@/components/emails/access-request"

export type EmailTemplates =
  | "request-access"
  | "access-request-pending"
  | "access-request-approved"
  | "access-request-rejected"

const emails: Record<
  EmailTemplates,
  React.ComponentType<{ data: Record<string, string> }>
> = {
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
