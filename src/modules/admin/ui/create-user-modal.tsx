"use client"

import { UserPlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CreateUserModal() {
  return (
    <Button variant="outline">
      <UserPlusIcon /> Add User
    </Button>
  )
}
