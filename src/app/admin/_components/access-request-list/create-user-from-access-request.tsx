"use client"

import { type AccessRequest } from "@prisma/client"
import { UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Hint } from "@/components/hint"
import { Button } from "@/components/ui/button"

export function CreateUserFromAccessRequest({
  request,
}: {
  request: AccessRequest
}) {
  const router = useRouter()

  const href = `/admin?tab=create-user&name=${encodeURIComponent(request.name)}&email=${encodeURIComponent(request.email)}`

  function handleRouteChange() {
    if (request.status !== "APPROVED") {
      return
    }
    router.push(href)
  }

  return (
    <Hint label="Create user from access request" asChild>
      <Button
        disabled={request.status !== "APPROVED"}
        onClick={handleRouteChange}
        size="icon"
        variant="outline"
      >
        <UserPlus className="size-4" />
        <span className="sr-only">Create user from access request</span>
      </Button>
    </Hint>
  )
}
