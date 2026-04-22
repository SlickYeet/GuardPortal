import Image from "next/image"

import { APP_NAME } from "@/constants"
import { LoginForm } from "@/modules/auth/ui/login-form"

export function LoginView() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 md:-mt-12 md:px-0 md:py-0">
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
          <h1 className="my-6 text-center font-bold text-4xl text-primary">
            Sign in to {APP_NAME}
          </h1>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
