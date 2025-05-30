"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, RefreshCw, UserPlus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { createNewUser } from "@/actions/user"
import { getAvailablePeerIPs } from "@/actions/wireguard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VirtualizedCombobox } from "@/components/virtualized-combobox"
import { cn } from "@/lib/utils"
import { UserSchema } from "@/schemas/user"

export function CreateUserForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = searchParams.get("name") || ""
  const email = searchParams.get("email") || ""

  const [availableIps, setAvailableIps] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingIps, setIsLoadingIps] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof UserSchema>>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: "",
      email: "",
      ipAddress: "",
    },
  })

  useEffect(() => {
    setValue("name", name)
    setValue("email", email)
  }, [name, email, setValue])

  useEffect(() => {
    loadAvailableIps()
  }, [])

  const loadAvailableIps = async () => {
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

  const onSubmit = async (values: z.infer<typeof UserSchema>) => {
    setIsLoading(true)
    try {
      const result = await createNewUser(values)
      if (result.success) {
        toast.success("User created successfully")
        reset()
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

  const ipAddress = watch("ipAddress")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="John Doe" />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name.message}</p>
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
          <p className="text-destructive text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="ipAddress">
            IP Address
            <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Button
            type="button"
            disabled={isLoadingIps}
            onClick={loadAvailableIps}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={cn("size-4", isLoadingIps ? "animate-spin" : "")}
            />
            <span>Refresh</span>
          </Button>
        </div>

        <VirtualizedCombobox
          options={availableIps}
          value={ipAddress}
          onSelectOption={(value) => {
            setValue("ipAddress", value)
          }}
          selectPlaceholder="Select an IP address"
          searchPlaceholder="Search IP addresses..."
          width="200px"
          height="200px"
        />

        <p className="text-muted-foreground text-sm">
          If left blank, a random IP will be assigned.
        </p>

        {errors.ipAddress && (
          <p className="text-destructive text-sm">{errors.ipAddress.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} size="lg" className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating User...
          </>
        ) : (
          <>
            <UserPlus className="size-4" />
            <span>Create User</span>
          </>
        )}
      </Button>
    </form>
  )
}
