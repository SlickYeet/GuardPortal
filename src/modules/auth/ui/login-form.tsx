"use client"

import { LogInIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth/client"

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false)

  async function handleOAuth() {
    try {
      setIsLoading(true)
      await authClient.signIn.oauth2({
        callbackURL: "/",
        fetchOptions: {
          onError({ error }) {
            console.error(error.message)
            toast.error("Something went wrong", {
              description: error.message,
            })
            setIsLoading(false)
          },
        },
        providerId: "authentik",
      })
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong", {
        description:
          error instanceof Error ? error.message : "See console for details.",
      })
    }
  }

  return (
    <Card>
      <CardContent className="px-8 py-6">
        <Button
          className="w-full"
          disabled={isLoading}
          onClick={handleOAuth}
          size="lg"
        >
          {isLoading ? <Spinner /> : <LogInIcon />}
          Sign In with HHN
        </Button>
      </CardContent>
    </Card>
  )
}
