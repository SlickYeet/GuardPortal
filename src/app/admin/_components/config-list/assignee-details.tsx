"use client"

import { Edit } from "lucide-react"
import Link from "next/link"

import { Hint } from "@/components/hint"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { TableCell } from "@/components/ui/table"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import type { User } from "@/types"

interface AssigneeDetailsProps {
  user: User
}

export function AssigneeDetails({ user }: AssigneeDetailsProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <TableCell>
        <Drawer>
          <DrawerTrigger>
            <Trigger user={user} />
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>User Details</DrawerTitle>
            </DrawerHeader>
            <UserDetails user={user} className="px-4 pb-10" />
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </TableCell>
    )
  }

  return (
    <TableCell>
      <HoverCard openDelay={100}>
        <HoverCardTrigger>
          <Trigger user={user} />
        </HoverCardTrigger>
        <HoverCardContent>
          <UserDetails user={user} />
        </HoverCardContent>
      </HoverCard>
    </TableCell>
  )
}

function Trigger({ user }: { user: User }) {
  return (
    <Avatar>
      <AvatarImage src={user.image} />
      <AvatarFallback>
        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
      </AvatarFallback>
    </Avatar>
  )
}

function UserDetails({ user, className }: { user: User; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar>
        <AvatarImage src={user.image} />
        <AvatarFallback>
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <p className="font-medium">{user.name || "Unknown User"}</p>
        <p className="text-muted-foreground text-sm">
          {user.email || "No email provided"}
        </p>
      </div>
      <Hint label="Manage User" asChild>
        <Button size="icon" variant="outline" asChild>
          <Link href="/admin?tab=manage-users" className="ml-auto">
            <Edit className="size-4" />
            <span className="sr-only">Edit User</span>
          </Link>
        </Button>
      </Hint>
    </div>
  )
}
