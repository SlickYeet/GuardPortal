import { render } from "@react-email/components"

export type EmailTemplates = "request-access"

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
