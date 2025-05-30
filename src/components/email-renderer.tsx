import { render } from "@react-email/components"

import ApprovedAccessRequestEmail from "@/components/emails/access-request/approved"
import PendingAccessRequestEmail from "@/components/emails/access-request/pending"
import RejectedAccessRequestEmail from "@/components/emails/access-request/rejected"
import AccessRequestEmail from "@/components/emails/access-request/to-admin"
import NewUserEmail from "@/components/emails/new-user"

export type EmailTemplates =
  | "new-user"
  | "access-request-to-admin"
  | "access-request-pending"
  | "access-request-approved"
  | "access-request-rejected"

const emails: Record<
  EmailTemplates,
  React.ComponentType<{ data: Record<string, string> }>
> = {
  "new-user": (props) => <NewUserEmail data={props.data} />,
  "access-request-to-admin": (props) => (
    <AccessRequestEmail data={props.data} />
  ),
  "access-request-pending": (props) => (
    <PendingAccessRequestEmail data={props.data} />
  ),
  "access-request-approved": (props) => (
    <ApprovedAccessRequestEmail data={props.data} />
  ),
  "access-request-rejected": (props) => (
    <RejectedAccessRequestEmail data={props.data} />
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
