import Image from "next/image"
import { redirect } from "next/navigation"

import { SuccessCard } from "./_components/success-card"

interface RequestAccessSuccessPageProps {
  searchParams: Promise<{
    email: string
  }>
}

export default async function RequestAccessSuccessPage({
  searchParams,
}: RequestAccessSuccessPageProps) {
  const { email } = await searchParams

  if (!email) {
    return redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 md:py-0">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <span className="text-muted-foreground text-sm tracking-wide">
            Powered by{" "}
          </span>
          <a
            href="https://wireguard.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/wireguard.svg"
              alt="wireguard logo"
              width={120}
              height={60}
              className="mx-auto mb-4 h-20 w-auto"
            />
          </a>
          <h1 className="text-primary my-6 text-center text-3xl font-extrabold">
            Your request has been submitted successfully!
          </h1>
        </div>
        <SuccessCard email={email} />
      </div>
    </div>
  )
}
