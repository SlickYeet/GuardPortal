"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, RefreshCw, UserPlus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { createNewUser } from "@/actions/user"
import {
  getAvailableConfigurations,
  getAvailablePeerIPs,
} from "@/actions/wireguard"
import { Hint } from "@/components/hint"
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
import { VirtualizedCombobox } from "@/components/virtualized-combobox"
import { type Configuration } from "@/generated/prisma"
import { cn } from "@/lib/utils"
import { UserSchema } from "@/schemas/user"

export function CreateUserForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = searchParams.get("name") || ""
  const email = searchParams.get("email") || ""

  const [availableIps, setAvailableIps] = useState<string[]>([])
  const [availableConfigurations, setAvailableConfigurations] = useState<
    Configuration[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingIps, setIsLoadingIps] = useState(true)
  const [isLoadingConfigurations, setIsLoadingConfigurations] = useState(true)

  const form = useForm<z.infer<typeof UserSchema>>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: "",
      email: "",
      configurationName: "",
      ipAddress: "",
    },
  })

  useEffect(() => {
    form.setValue("name", name)
    form.setValue("email", email)
  }, [name, email, form])

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

  const onSubmit = async (values: z.infer<typeof UserSchema>) => {
    setIsLoading(true)
    try {
      const result = await createNewUser(values)
      if (result.success) {
        toast.success("User created successfully")
        form.reset()
        router.push("/admin?tab=create-user")
        loadAvailableIps()
      } else {
        toast.error("Error", {
          description: result.message || "Failed to create user",
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Error", {
        description: "An unexpected error occurred while creating the user",
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
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

        <Button type="submit" disabled={isLoading} size="lg" className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Creating User...</span>
            </>
          ) : (
            <>
              <UserPlus className="size-4" />
              <span>Create User</span>
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
