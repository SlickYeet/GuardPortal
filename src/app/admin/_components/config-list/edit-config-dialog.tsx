"use client"

import { Edit, Loader2, RefreshCw, Save } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { VirtualizedCombobox } from "@/components/virtualized-combobox"
import { cn, parseConfigName } from "@/lib/utils"
import { ConfigUpdateSchema } from "@/schemas/config"
import type { PeerConfigWithUser, User } from "@/types"

interface EditConfigDialogProps {
  initConfig: PeerConfigWithUser
  configToEdit: string | null
  setConfigToEdit: (configId: string | null) => void
  isEditing: boolean
  handleEditConfig: (
    values: Partial<z.infer<typeof ConfigUpdateSchema>>,
  ) => void
  defaultConfig: string
}

export function EditConfigDialog({
  initConfig,
  configToEdit,
  setConfigToEdit,
  isEditing,
  handleEditConfig,
  defaultConfig,
}: EditConfigDialogProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [availableIps, setAvailableIps] = useState<string[]>([])
  const [isLoadingIps, setIsLoadingIps] = useState(true)

  useEffect(() => {
    loadUsers()
    loadAvailableIps()
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

  const configName = parseConfigName(initConfig.name)

  const form = useForm<Partial<z.infer<typeof ConfigUpdateSchema>>>({
    defaultValues: {
      id: initConfig.id,
      name: configName,
      userId: initConfig?.user.id,
      ipAddress: initConfig?.allowedIPs,
      content: "",
    },
  })

  const isSubmitting = form.formState.isSubmitting

  return (
    <Dialog
      open={!!configToEdit}
      onOpenChange={(open) => !open && setConfigToEdit(null)}
    >
      <DialogTrigger asChild>
        <Hint label="Edit Config" asChild>
          <Button
            disabled={isEditing}
            onClick={() => setConfigToEdit(initConfig.id)}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Edit Config</span>
            <Edit className="size-4" />
          </Button>
        </Hint>
      </DialogTrigger>
      <DialogContent>
        <ScrollArea className="max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit Config</DialogTitle>
            <DialogDescription>
              Edit the peer configuration details below. Make sure to review the
              changes before saving.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEditConfig)}
              className="mt-2 space-y-6"
            >
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => <input type="hidden" {...field} />}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
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
                        <span className="text-muted-foreground">
                          (Optional)
                        </span>
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
                          className="w-[calc(100%-52px)]"
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
                            You can paste the content of a WireGuard config file
                            here. If left blank, a default config will be used.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <DialogFooter>
                <div className="flex w-full justify-between">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Close
                    </Button>
                  </DialogClose>
                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    variant="secondary"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
