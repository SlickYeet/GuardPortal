import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/utils"
import { db } from "@/server/db"
import { user as userTable } from "@/server/db/schema"

export default async function Page() {
  const session = await getSession()

  if (session) return redirect("/")

  const userCount = await db.$count(userTable)

  return (
    <div className="flex min-h-screen items-center justify-center py-12 md:-mt-12 md:py-0">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <span className="text-muted-foreground text-sm tracking-wide">
            Powered by{" "}
          </span>
          <a
            href="https://wireguard.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              alt="wireguard logo"
              className="mx-auto mb-4 h-20 w-auto"
              height={60}
              loading="eager"
              src="/wireguard.svg"
              width={120}
            />
          </a>
          <h1 className="my-6 text-center text-primary">
            {userCount > 0 ? (
              <span className="font-bold text-4xl">Sign in to HHN VPN</span>
            ) : (
              <>
                <span className="font-bold text-4xl">
                  Create your first user
                </span>
                <span>
                  <br />
                  <span className="text-muted-foreground text-sm">
                    As the first user, you&apos;ll also set up your own
                    WireGuard peer.
                  </span>
                </span>
              </>
            )}
          </h1>
        </div>
        {userCount > 0 && (
          <>
            {/* <SignInForm /> */}
            <div className="mx-auto max-w-sm text-balance text-center text-muted-foreground text-sm">
              <p>
                To request access, please fill out the{" "}
                <Link
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                  href="/request-access"
                >
                  access request form
                </Link>
                .
              </p>
            </div>
          </>
        )}
        {/* {userCount === 0 && <CreateFirstUser />} */}
      </div>
    </div>
  )
}
