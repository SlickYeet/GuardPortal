"use client"

import { type User } from "better-auth"
import { LogOut, Shield, SunMoon } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

import { signOut } from "@/actions/auth"
import { Hint } from "@/components/hint"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  user: User
  isAdmin?: boolean
}

export function UserMenu({ user, isAdmin = false }: UserMenuProps) {
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === "dark"

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Failed to sign out:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user.image || "https://gravatar.com/avatar/HASH"} />
          <AvatarFallback>
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              src={user.image || "https://gravatar.com/avatar/HASH"}
            />
            <AvatarFallback>
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="flex items-center text-sm font-medium">
              {user.name || "User"}
              {isAdmin && (
                <Hint label="Admin User">
                  <Shield className="text-primary fill-primary ml-1.5 size-4" />
                </Hint>
              )}
            </span>
            <div className="text-muted-foreground text-xs">
              {user.email || "No email provided"}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
            <span className="flex items-center gap-2">
              <SunMoon className="size-4" />
              Toggle Theme
            </span>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Shield className="size-4" />
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
