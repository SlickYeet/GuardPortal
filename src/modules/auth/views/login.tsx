import Image from "next/image"

import { LoginForm } from "@/modules/auth/ui/login-form"

export function LoginView({ appName }: { appName: string }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,88,56,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(217,88,56,0.08),transparent_28%)]" />
      <div className="-mt-40 w-full max-w-lg space-y-8">
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
