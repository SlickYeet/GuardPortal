import Image from "next/image"

import { LoginForm } from "@/modules/auth/ui/login-form"

export function LoginView({ appName }: { appName: string }) {
  return (
    <div className="-mt-12 flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <span className="text-muted-foreground text-xs tracking-wide">
            Powered by{" "}
          </span>
          <a
            href="https://wireguard.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="relative mx-auto h-20 w-auto">
              <Image
                alt="wireguard logo"
                className="object-contain"
                fill
                loading="eager"
                src="/wireguard.svg"
              />
            </div>
          </a>
          <h1 className="my-6 text-center font-bold text-3xl md:text-4xl">
            Sign in to {appName}
          </h1>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
