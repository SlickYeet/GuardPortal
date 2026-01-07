"use client"

import { UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Hint } from "@/components/hint"
import { Button } from "@/components/ui/button"
import { type AccessRequest } from "@/generated/prisma"

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

  return request.status === "APPROVED" ? (
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
  ) : (
    <Hint label="Request not approved" asChild>
      <Button
        size="icon"
        variant="outline"
        className="cursor-not-allowed opacity-50"
      >
        <UserPlus className="size-4" />
        <span className="sr-only">Create user from access request</span>
      </Button>
    </Hint>
  )
}
