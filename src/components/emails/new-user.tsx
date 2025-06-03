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

interface NewUserEmailProps {
  data: {
    email?: string
    password?: string
  }
}

export default function NewUserEmail({
  data: { email, password },
}: NewUserEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-200 font-sans">
          <Preview>Welcome to HHN VPN!</Preview>
          <Container className="mx-auto overflow-hidden rounded-lg bg-white">
            <Section>
              <Row>
                <Column>
                  <Img
                    src="https://cdn.famlam.ca/assets/favicon-squre.svg"
                    height="80"
                    alt="HHN VPN Logo"
                    className="mx-auto px-10 pt-5"
                  />
                </Column>
              </Row>
            </Section>

            <Section className="px-10">
              <Hr className="my-5 border border-[#e8eaed]" />
              <Heading className="text-center text-2xl leading-6 font-bold text-[#ff2056]">
                Welcome to HHN VPN!
              </Heading>
              <Text className="text-center text-base leading-5 text-balance text-[#09090b]">
                We have generated a temporary password for you. After logging
                in, you will be prompted to change it.
              </Text>
              <Text className="mt-2 text-center text-xs leading-5 text-[#ff2056]">
                For your security, please do not share this password with
                anyone.
              </Text>
              <Hr className="border border-[#e8eaed]" />
            </Section>

            <Section className="mx-auto mb-4 w-[50%] overflow-hidden">
              <Text className="text-center text-lg leading-5 font-semibold text-[#09090b]">
                Email:
              </Text>
              <Section className="rounded-lg bg-gray-200 py-2">
                <Text className="px-4 text-center text-xl leading-5 text-[#09090b]">
                  {email || "your@email.com"}
                </Text>
              </Section>
            </Section>
            <Section className="mx-auto mb-4 w-[50%] overflow-hidden">
              <Text className="text-center text-lg leading-5 font-semibold text-[#09090b]">
                Temporary Password:
              </Text>
              <Section className="rounded-lg bg-gray-200 py-2">
                <Text className="px-4 text-center text-xl leading-5 text-[#09090b]">
                  {password || "********"}
                </Text>
              </Section>
            </Section>

            <Section className="mb-4 w-full text-center">
              <Link
                href={baseUrl}
                className="inline-block rounded bg-[#ff2056] px-6 py-2 text-base font-bold text-white"
              >
                Log in to HHN VPN
              </Link>
            </Section>

            <Section className="px-10">
              <Text className="text-center text-sm leading-5 text-[#09090b]">
                Thank you,
              </Text>
              <Text className="text-center text-xl leading-5 text-[#09090b]">
                The HHN VPN Team
              </Text>
              <Hr className="border border-[#e8eaed]" />
            </Section>

            <Section className="mb-4 w-[90%] overflow-hidden rounded-lg bg-gray-200 pl-5">
              <Row>
                <Text className="text-center text-sm leading-5 text-[#09090b]">
                  Need help?
                </Text>
                <Text className="text-center text-sm leading-5 text-[#09090b]">
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

NewUserEmail.PreviewProps = {
  data: {
    email: "lasse@famlam.ca",
    password: "Password123!",
  },
} satisfies NewUserEmailProps
