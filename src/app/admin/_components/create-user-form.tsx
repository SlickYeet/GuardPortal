"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FixedSizeList as List } from "react-window"
import { toast } from "sonner"
import { z } from "zod"

import { createNewUser } from "@/actions/user"
import { getAvailablePeerIPs } from "@/actions/wireguard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { userSchema } from "@/schemas/user"

export function CreateUserForm() {
  const [availableIps, setAvailableIps] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingIps, setIsLoadingIps] = useState(true)
  const [tempPassword, setTempPassword] = useState<string>("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      ipAddress: "",
    },
  })

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

  async function onSubmit(data: z.infer<typeof userSchema>) {
    setIsLoading(true)
    try {
      const result = await createNewUser(data)
      if (result.success) {
        toast.success("User created successfully", {
          description: `Temporary password: ${result.tempPassword}`,
        })
        setTempPassword(result.tempPassword || "")
        reset()
        // Refresh available IPs after creating a user
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} placeholder="John Doe" />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            {...register("email")}
            placeholder="john@example.com"
            type="email"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="ipAddress">IP Address</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={loadAvailableIps}
              disabled={isLoadingIps}
            >
              {isLoadingIps ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>

          <Select
            disabled={isLoadingIps}
            value={watch("ipAddress")}
            onValueChange={(value) => setValue("ipAddress", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an IP address" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingIps ? (
                <SelectItem value="loading" disabled>
                  Loading available IPs...
                </SelectItem>
              ) : availableIps.length === 0 ? (
                <SelectItem value="none" disabled>
                  No available IP addresses
                </SelectItem>
              ) : (
                <>
                  <div style={{ display: "none" }}>
                    {watch("ipAddress") && (
                      <div style={{ display: "none" }}>
                        <SelectItem value={watch("ipAddress")}>
                          {watch("ipAddress")}
                        </SelectItem>
                      </div>
                    )}
                  </div>
                  <List
                    height={200}
                    itemCount={availableIps.length}
                    itemSize={36}
                    width="100%"
                  >
                    {({ index, style }) => (
                      <div style={style}>
                        <SelectItem
                          key={availableIps[index]}
                          value={availableIps[index]}
                        >
                          {availableIps[index]}
                        </SelectItem>
                      </div>
                    )}
                  </List>
                </>
              )}
            </SelectContent>
          </Select>
          {errors.ipAddress && (
            <p className="text-sm text-red-500">{errors.ipAddress.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating User...
            </>
          ) : (
            "Create User"
          )}
        </Button>
      </form>

      {tempPassword && (
        <div className="rounded-md border bg-yellow-50 p-4">
          <h3 className="font-medium text-yellow-800">
            Temporary Password Generated
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            Make sure to copy this password now. It won&&apos;t be shown again.
          </p>
          <div className="mt-2 flex items-center justify-between rounded border bg-white p-2">
            <code className="font-mono text-sm">{tempPassword}</code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(tempPassword)
                toast.success("Password copied to clipboard")
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
