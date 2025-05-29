import Image from "next/image"
import Link from "next/link"

import { db } from "@/server/db"

import { CreateFirstUser } from "./_components/create-first-user"
import { SignInForm } from "./_components/signin-form"

export default async function HomePage() {
  const userCount = await db.user.count()

  return (
    <div className="flex min-h-screen items-center justify-center py-12 md:-mt-12 md:py-0">
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
            {userCount > 0 ? (
              "Sign in to HHN VPN"
            ) : (
              <>
                <span>Create your first user</span>
                <span>
                  <br />
                  <span className="text-muted-foreground text-sm">
                    (As the first user, you&apos;ll also set up your own
                    WireGuard peer.)
                  </span>
                </span>
              </>
            )}
          </h1>
        </div>
        {userCount > 0 && (
          <>
            <SignInForm />
            <div className="text-muted-foreground text-center text-sm">
              <p>
                To request access, please fill out the{" "}
                <Link
                  href="/request-access"
                  className="text-primary hover:text-primary/80 underline underline-offset-2"
                >
                  access request form
                </Link>
                .
              </p>
            </div>
          </>
        )}
        {userCount === 0 && <CreateFirstUser />}
      </div>
    </div>
  )
}
