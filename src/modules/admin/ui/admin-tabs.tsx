"use client"

import { FileCogIcon, SettingsIcon, UsersIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABS = [
  { icon: UsersIcon, label: "Users", value: "users" },
  { icon: FileCogIcon, label: "Peer Configs", value: "configs" },
  { icon: SettingsIcon, label: "Settings", value: "settings" },
] as const
type Tab = (typeof TABS)[number]["value"]

export function AdminTabs({ children }: React.PropsWithChildren) {
  const router = useRouter()
  const pathname = usePathname()

  const [currentTab, setCurrentTab] = React.useState<Tab>(() => {
    const pathParts = pathname.split("/")
    const lastPart = pathParts[pathParts.length - 1]
    if (TABS.some((tab) => tab.value === lastPart)) {
      return lastPart as Tab
    }
    return "users"
  })

  function handleTabChange(tab: string) {
    const validTab = tab as Tab
    setCurrentTab(validTab)
    router.push(`/admin/${validTab}`)
  }

  return (
    <Tabs
      defaultValue="users"
      onValueChange={handleTabChange}
      value={currentTab}
    >
      <ScrollArea>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              <tab.icon className="size-4" />
              <span className="ml-2">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </ScrollArea>
      {children}
    </Tabs>
  )
}
