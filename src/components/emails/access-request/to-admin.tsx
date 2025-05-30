import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

const baseUrl = process.env.NEXT_PUBLIC_URL
  ? `https://${process.env.NEXT_PUBLIC_URL}`
  : "http://localhost:3000"

interface AccessRequestEmailProps {
  data: {
    name?: string
    email?: string
    reason?: string
  }
}

export default function AccessRequestEmail({
  data: { name, email, reason },
}: AccessRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-200 font-sans">
          <Preview>New HHN VPN Access Request</Preview>
          <Container className="mx-auto overflow-hidden rounded-lg bg-white p-8">
            <Section>
              <Text className="mb-2 text-lg font-bold text-[#ff2056]">
                New VPN Access Request
              </Text>
              <Hr className="my-4 border border-[#e8eaed]" />
              <Text className="text-sm text-[#09090b]">
                A new request for VPN access has been submitted with the
                following details:
              </Text>
              <Text className="mt-4 text-sm text-[#09090b]">
                <b>Name:</b> {name || "N/A"}
              </Text>
              <Text className="text-sm text-[#09090b]">
                <b>Email:</b> {email || "N/A"}
              </Text>
              <Text className="text-sm text-[#09090b]">
                <b>Reason:</b> {reason || "No reason provided"}
              </Text>
              <Hr className="my-4 border border-[#e8eaed]" />
              <Text className="text-xs text-[#666]">
                Please review this request in the{" "}
                <Link href={`${baseUrl}/admin`} className="text-[#ff2056]">
                  admin panel
                </Link>
                .
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

AccessRequestEmail.PreviewProps = {
  data: {
    name: "Lasse",
    email: "lasse@famlam.ca",
    reason: "Need access for testing purposes",
  },
} satisfies AccessRequestEmailProps
