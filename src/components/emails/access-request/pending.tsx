import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

const baseUrl = process.env.NEXT_PUBLIC_URL
  ? process.env.NEXT_PUBLIC_URL
  : "http://localhost:3000"
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "lasse@famlam.ca"

interface PendingAccessRequestEmailProps {
  data: {
    name?: string
    email?: string
    reason?: string
  }
}

export default function PendingAccessRequestEmail({
  data: { name, email, reason },
}: PendingAccessRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-200 font-sans">
          <Preview>HHN VPN Access Request Received</Preview>
          <Container className="mx-auto overflow-hidden rounded-lg bg-white">
            <Section>
              <Row>
                <Column>
                  <Img
                    src="https://cdn.famlam.ca/assets/favicon-squre.svg"
                    height="80"
                    alt="HHN VPN Logo"
                    className="px-10 pt-5"
                  />
                </Column>
              </Row>
            </Section>

            <Section className="px-10">
              <Hr className="my-5 border border-[#e8eaed]" />
              <Heading className="text-sm leading-6 font-bold text-[#ff2056]">
                ACCESS REQUEST STATUS - PENDING
              </Heading>
              <Text className="text-sm leading-5 text-[#09090b]">
                Hi {name || "there"},
              </Text>
              <Text className="text-sm leading-5 text-[#09090b]">
                Thank you for your interest in accessing the HHN VPN. We have
                received your request and it is currently pending review.
              </Text>
              <Text className="text-sm leading-5 text-[#09090b]">
                A network administrator will review your request and get back to
                you as soon as possible. Please allow up to 48 hours for a
                response.
              </Text>
              <Hr className="border border-[#e8eaed]" />
            </Section>

            <Section className="px-10">
              <Text className="text-sm leading-5 text-[#09090b]">
                Here are the details of your request:
              </Text>
              <Text className="text-sm leading-5 text-[#09090b]">
                <b>Name:</b> {name || "N/A"}
              </Text>
              <Text className="text-sm leading-5 text-[#09090b]">
                <b>Email:</b> {email || "N/A"}
              </Text>
              <Text className="text-sm leading-5 text-[#09090b]">
                <b>Reason:</b> {reason || "No reason provided"}
              </Text>
              <Text className="text-sm leading-5 text-[#09090b]">
                <b>Status:</b> Pending
              </Text>
            </Section>

            <Section className="px-10">
              <Text className="text-sm leading-5 text-[#09090b]">
                Thank you,
              </Text>
              <Text className="text-xl leading-5 text-[#09090b]">
                The HHN VPN Team
              </Text>
              <Hr className="border border-[#e8eaed]" />
            </Section>

            <Section className="mb-4 w-[90%] overflow-hidden rounded-lg bg-gray-200 pl-5">
              <Row>
                <Text className="text-sm leading-5 text-[#09090b]">
                  Need help?
                </Text>
                <Text>
                  Get in touch with us at{" "}
                  <Link
                    href={`mailto:${contactEmail}`}
                    className="text-sm leading-5 text-[#ff2056]"
                  >
                    {contactEmail}
                  </Link>
                </Text>
              </Row>
            </Section>

            <Section className="px-10 pb-8">
              <Text className="m-0 text-center text-xs leading-5 text-[#09090b]">
                © {new Date().getFullYear()}{" "}
                <Link href={baseUrl} className="text-[#ff2056]">
                  HHN VPN
                </Link>
                . All rights reserved.
              </Text>
              <Text className="m-0 text-center text-xs leading-5 text-balance text-[#09090b]">
                You have received this email because you have recently requested
                access to the HHN VPN. If you did not make this request, please
                contact us at{" "}
                <Link
                  href={`mailto:${contactEmail}`}
                  className="text-sm leading-5 text-[#ff2056]"
                >
                  {contactEmail}
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

PendingAccessRequestEmail.PreviewProps = {
  data: {
    name: "Lasse",
    email: "lasse@famlam.ca",
    reason: "Need access for testing purposes",
  },
} satisfies PendingAccessRequestEmailProps
