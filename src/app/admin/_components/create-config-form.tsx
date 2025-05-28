"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { createPeerConfig } from "@/actions/config"
import { getUsers } from "@/actions/user"
import { getAvailablePeerIPs } from "@/actions/wireguard"
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
import { cn } from "@/lib/utils"
import { ConfigSchema } from "@/schemas/config"
import { User } from "@/types"

export function CreateConfigForm({
  defaultConfig,
}: {
  defaultConfig?: string
}) {
  const [users, setUsers] = useState<User[]>([])
  const [availableIps, setAvailableIps] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingIps, setIsLoadingIps] = useState(true)

  const form = useForm<z.infer<typeof ConfigSchema>>({
    resolver: zodResolver(ConfigSchema),
    defaultValues: {
      name: "",
      content: "",
      userId: "",
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

  const onSubmit = async (values: z.infer<typeof ConfigSchema>) => {
    setIsLoading(true)
    try {
      const result = await createPeerConfig(values)
      if (result.success) {
        toast.success("Config created successfully", {
          description: `Config name: ${result.name}`,
        })
        form.reset()
        // Refresh available IPs after creating a config
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
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Select User</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
          <FormField
            control={form.control}
            name="ipAddress"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  <p>
                    IP Address{" "}
                    <span className="text-muted-foreground">(Optional)</span>
                  </p>
                </FormLabel>
                <div className="flex items-center justify-between">
                  <FormControl>
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
                      width="calc(100% - 50px)"
                      height="200px"
                    />
                  </FormControl>
                  <Hint label="Refresh IPs" asChild>
                    <Button
                      type="button"
                      disabled={isLoadingIps}
                      onClick={loadAvailableIps}
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

        <Button type="submit" disabled={isLoading} size="lg">
          <Plus className="size-4" />
          Create Config
        </Button>
      </form>
    </Form>
  )
}
