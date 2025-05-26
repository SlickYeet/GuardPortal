import { headers } from "next/headers"
import Image from "next/image"
import { redirect } from "next/navigation"

import { SignInForm } from "@/components/signin-form"
import { auth } from "@/server/auth"

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (session) {
    redirect("/vpn")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Image
            src="/wireguard.svg"
            alt="wireguard logo"
            width={120}
            height={60}
            className="mx-auto mb-4 h-20 w-auto"
          />
          <h2 className="text-primary my-6 text-center text-3xl font-extrabold">
            Sign in to HHN VPN
          </h2>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
