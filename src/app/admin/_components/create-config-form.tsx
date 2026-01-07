"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FilePlus2, Loader2, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { getUsers } from "@/actions/user"
import {
  createPeerConfig,
  getAvailableConfigurations,
  getAvailablePeerIPs,
} from "@/actions/wireguard"
import { Hint } from "@/components/hint"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { VirtualizedCombobox } from "@/components/virtualized-combobox"
import { type Configuration } from "@/generated/prisma"
import { cn } from "@/lib/utils"
import { ConfigSchema } from "@/schemas/config"
import type { User } from "@/types"

export function CreateConfigForm({
  defaultConfig,
}: {
  defaultConfig?: string
}) {
  const [users, setUsers] = useState<User[]>([])
  const [availableIps, setAvailableIps] = useState<string[]>([])
  const [availableConfigurations, setAvailableConfigurations] = useState<
    Configuration[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingIps, setIsLoadingIps] = useState(true)
  const [isLoadingConfigurations, setIsLoadingConfigurations] = useState(true)

  const form = useForm<z.infer<typeof ConfigSchema>>({
    resolver: zodResolver(ConfigSchema),
    defaultValues: {
      name: "",
      content: "",
      userId: "",
      configurationName: "",
      ipAddress: "",
    },
  })

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setIsLoadingUsers(true)
    try {
      const fetchedUsers = await getUsers()
      setUsers(fetchedUsers as User[])
    } catch (error) {
      console.error("Failed to load users:", error)
      toast.error("Error", {
        description: `Failed to load users: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    loadAvailableIps()
    loadAvailableConfigurations()
  }, [])

  async function loadAvailableIps() {
    setIsLoadingIps(true)
    try {
      const ipsObj = await getAvailablePeerIPs()
      const ips = Object.values(ipsObj)
        .flat()
        .filter((ip): ip is string => typeof ip === "string")
      setAvailableIps(ips)
    } catch (error) {
      console.error("Error loading available IPs:", error)
      toast.error("Error", {
        description: "Failed to load available IP addresses",
      })
    } finally {
      setIsLoadingIps(false)
    }
  }

  async function loadAvailableConfigurations() {
    setIsLoadingConfigurations(true)
    try {
      const configurations = await getAvailableConfigurations()
      setAvailableConfigurations(configurations)
    } catch (error) {
      console.error("Error loading configurations:", error)
      toast.error("Error", {
        description: "Failed to load configurations",
      })
    } finally {
      setIsLoadingConfigurations(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof ConfigSchema>) => {
    setIsLoading(true)
    try {
      const result = await createPeerConfig(values)
      if (result.success) {
        toast.success("Config created successfully", {
          description: `Config name: ${result.name}`,
        })
        form.reset()
        loadAvailableIps()
      } else {
        toast.error("Error", {
          description: result.message || "Failed to create config",
        })
      }
    } catch (error) {
      console.error("Error creating config:", error)
      toast.error("Error", {
        description: "An unexpected error occurred while creating the config",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Config Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter config name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Select User</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  {isLoadingUsers ? (
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Loading users..." />
                    </SelectTrigger>
                  ) : (
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                  )}
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <FormField
            control={form.control}
            name="ipAddress"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  IP Address{" "}
                  <span className="text-muted-foreground">(Optional)</span>
                </FormLabel>
                <div className="flex items-center justify-between gap-4">
                  <FormControl className="w-full">
                    <VirtualizedCombobox
                      options={availableIps}
                      value={field.value}
                      onSelectOption={(value) => {
                        field.onChange(value)
                      }}
                      selectPlaceholder={
                        isLoadingIps
                          ? "Loading IP addresses"
                          : "Select an IP address"
                      }
                      searchPlaceholder="Search IP addresses..."
                      className="w-[calc(100%-52px)]"
                    />
                  </FormControl>
                  <Hint label="Refresh IPs" asChild>
                    <Button
                      type="button"
                      disabled={isLoadingIps}
                      onClick={loadAvailableIps}
                      tabIndex={-1}
                      size="icon"
                      variant="outline"
                    >
                      <RefreshCw
                        className={cn(
                          "size-4",
                          isLoadingIps ? "animate-spin" : "",
                        )}
                      />
                    </Button>
                  </Hint>
                </div>
                <FormDescription>
                  If left blank, a random IP will be assigned.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="configurationName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Configuration Name</FormLabel>
                <div className="flex items-center justify-between gap-4">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            isLoadingConfigurations
                              ? "Loading configurations..."
                              : "Select a configuration"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableConfigurations.map((configuration) => (
                        <SelectItem
                          key={configuration.name}
                          value={configuration.name}
                        >
                          {configuration.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Hint label="Refresh Configurations" asChild>
                    <Button
                      type="button"
                      disabled={isLoadingConfigurations}
                      onClick={loadAvailableConfigurations}
                      tabIndex={-1}
                      size="icon"
                      variant="outline"
                    >
                      <RefreshCw
                        className={cn(
                          "size-4",
                          isLoadingConfigurations ? "animate-spin" : "",
                        )}
                      />
                    </Button>
                  </Hint>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="content">
            <AccordionTrigger>
              <p>
                Config Content{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </p>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                This is an advanced option. Use with caution.
              </p>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <FormControl>
                      <Textarea
                        placeholder={defaultConfig}
                        rows={11}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You can paste the content of a WireGuard config file here.
                      If left blank, a default config will be used.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button type="submit" disabled={isLoading} size="lg" className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Creating Config...</span>
            </>
          ) : (
            <>
              <FilePlus2 className="size-4" />
              <span>Create Config</span>
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
