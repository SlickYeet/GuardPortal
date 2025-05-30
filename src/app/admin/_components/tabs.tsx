"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, type ReactNode } from "react"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const validTabs = [
  "create-user",
  "create-config",
  "manage-users",
  "manage-configs",
  "access-requests",
] as const
type TabValue = (typeof validTabs)[number]

export function AdminTabs({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const getTabFromParams = useCallback(() => {
    const urlTab = searchParams.get("tab")
    return validTabs.includes(urlTab as TabValue)
      ? (urlTab as TabValue)
      : "create-user"
  }, [searchParams])

  const [activeTab, setActiveTab] = useState<TabValue>(getTabFromParams)

  useEffect(() => {
    const tab = getTabFromParams()
    setActiveTab(tab)
  }, [getTabFromParams])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams],
  )

  const handleTabChange = (tab: string) => {
    const validTab = tab as TabValue
    setActiveTab(validTab)
    router.push(pathname + "?" + createQueryString("tab", validTab))
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      defaultValue="create-user"
      className="space-y-6"
    >
      <ScrollArea>
        <TabsList>
          <TabsTrigger value="create-user">Create User</TabsTrigger>
          <TabsTrigger value="manage-users">Manage Users</TabsTrigger>
          <TabsTrigger value="create-config">Create Config</TabsTrigger>
          <TabsTrigger value="manage-configs">Manage Configs</TabsTrigger>
          <TabsTrigger value="access-requests">Access Requests</TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {children}
    </Tabs>
  )
}
