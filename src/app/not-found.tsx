import { ArrowLeftIcon, LogInIcon, ShieldAlertIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,88,56,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(217,88,56,0.08),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl items-center justify-center">
        <Card className="w-full bg-background/95 shadow-xl ring-0 backdrop-blur-sm">
          <CardHeader className="gap-4 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldAlertIcon className="size-7" />
            </div>
            <div className="space-y-2">
              <CardTitle className="font-heading text-3xl sm:text-4xl">
                Page not found
              </CardTitle>
              <CardDescription className="mx-auto max-w-md text-balance text-base">
                The page you&apos;re looking for does not exist, may have moved,
                or was never available.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:justify-center">
            <Button
              className="max-sm:w-full"
              nativeButton={false}
              render={<Link href="/" />}
            >
              <ArrowLeftIcon /> Back to dashboard
            </Button>
            <Button
              className="max-sm:w-full"
              nativeButton={false}
              render={<Link href="/login" />}
              variant="outline"
            >
              <LogInIcon /> Go to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
