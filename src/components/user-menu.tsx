"use client"

import { LogOutIcon, ShieldIcon, SunMoonIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"

import { Hint } from "@/components/hint"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/auth/client"
import type { User } from "@/lib/auth/utils"

interface UserMenuProps {
  isAdmin: boolean
  user: User
}

export function UserMenu({ isAdmin, user }: UserMenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess() {
          router.push("/auth/signin")
        },
      },
    })
  }

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const shortUserName = user.name.split(" ")[0][0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton={false}
        render={
          <Avatar className="size-8">
            <AvatarImage alt={user.name} src={user.image ?? undefined} />
            <AvatarFallback className="text-sm capitalize">
              {shortUserName}
            </AvatarFallback>
          </Avatar>
        }
      />
      <DropdownMenuContent align="end" className="min-w-56 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="size-8">
                <AvatarImage alt={user.name} src={user.image ?? undefined} />
                <AvatarFallback className="text-sm capitalize">
                  {shortUserName}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-1">
                  <span className="truncate font-medium text-sm capitalize">
                    {user.name}
                  </span>
                  {isAdmin && (
                    <Hint label="Admin User">
                      <ShieldIcon className="size-3.5 fill-primary text-primary" />
                    </Hint>
                  )}
                </div>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={toggleTheme}>
            <SunMoonIcon />
            Toggle Theme
            <DropdownMenuShortcut>D</DropdownMenuShortcut>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem
              nativeButton={false}
              render={<Link href={pathname === "/admin" ? "/" : "/admin"} />}
            >
              <ShieldIcon />
              {pathname === "/admin" ? "VPN Details" : "Admin Dashboard"}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleSignOut} variant="destructive">
            <LogOutIcon />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
