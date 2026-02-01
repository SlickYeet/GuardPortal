import { headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth"

import { RequestAccessForm } from "./_components/request-access-form"

export default async function RequestAccessPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.session) return redirect("/")

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
            Request Access to HHN VPN
          </h1>
        </div>
        <RequestAccessForm />
        <div className="text-muted-foreground text-center text-sm">
          <p>
            Already have an account?{" "}
            <Link
              href="/"
              className="text-primary hover:text-primary/80 underline underline-offset-2"
            >
              Sign in here
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
