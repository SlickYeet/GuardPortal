"use client"

import { FileCogIcon, SettingsIcon, UsersIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"

const TABS = [
  { icon: UsersIcon, label: "Users", value: "users" },
  { icon: FileCogIcon, label: "Peer Configs", value: "configs" },
  { icon: SettingsIcon, label: "Site Settings", value: "settings" },
] as const
type Tab = (typeof TABS)[number]

export function AdminTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const currentTab = React.useMemo<Tab["value"]>(() => {
    const pathParts = pathname.split("/")
    const lastPart = pathParts[pathParts.length - 1]
    if (TABS.some((tab) => tab.value === lastPart)) {
      return lastPart as Tab["value"]
    }
    return "users"
  }, [pathname])

  function handleTabChange(tab: string | null) {
    const validTab = tab as Tab["value"]
    router.push(`/admin/${validTab}`)
  }

  const Tab = ({ tab }: { tab: Tab }) => (
    <>
      <tab.icon className="size-4" />
      <span>{tab.label}</span>
    </>
  )

  if (isMobile) {
    return (
      <Select
        defaultValue="users"
        items={TABS}
        onValueChange={handleTabChange}
        value={currentTab}
      >
        <SelectTrigger className="w-full" size="lg">
          <SelectValue placeholder="Select a tab..." />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {TABS.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>
                <Tab tab={tab} />
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }

  return (
    <Tabs
      defaultValue="users"
      onValueChange={handleTabChange}
      value={currentTab}
    >
      <ScrollArea>
        <TabsList variant="line">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              <Tab tab={tab} />
            </TabsTrigger>
          ))}
        </TabsList>
      </ScrollArea>
    </Tabs>
  )
}
