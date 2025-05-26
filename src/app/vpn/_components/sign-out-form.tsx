"use client"

import { Loader2, LogOut } from "lucide-react"
import { useActionState } from "react"

import { signOut } from "@/actions/auth"
import { Button } from "@/components/ui/button"

export function SignOutForm() {
  const [state, action, pending] = useActionState(signOut, { error: "" })

  return (
    <form action={action}>
      <Button
        type="submit"
        disabled={pending}
        variant={state?.error ? "destructive" : "outline"}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}
        {state?.error
          ? "Sign Out Failed"
          : pending
            ? "Signing Out..."
            : "Sign Out"}
      </Button>
    </form>
  )
}
