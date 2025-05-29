"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { env } from "@/env"

interface SuccessCardProps {
  email: string
}

export function SuccessCard({ email }: SuccessCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Success! 🎉</CardTitle>
        <CardDescription>
          A network administrators will review your request and get back to you
          at <strong>{email}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        Now sit back and relax while we process your request. If you have any
        questions, feel free to reach out at{" "}
        <a
          href="mailto:lasse@famlam.ca"
          className="text-primary hover:text-primary/80 underline underline-offset-2"
        >
          {env.NEXT_PUBLIC_CONTACT_EMAIL}
        </a>
      </CardContent>
      <CardFooter>
        <CardAction>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Return to Sign In
            </Link>
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  )
}
