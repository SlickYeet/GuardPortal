"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AccessRequestStatus, type AccessRequest } from "@prisma/client"
import {
  CircleCheckBig,
  CircleEllipsis,
  CircleX,
  Edit,
  Loader2,
  Save,
} from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { updateAccessRequest } from "@/actions/access-requests"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UpdateAccessRequestSchema } from "@/schemas/request-access"

export function formatStatusLabel(status: AccessRequestStatus) {
  switch (status) {
    case "PENDING":
      return (
        <span className="flex items-center gap-2">
          <CircleEllipsis className="size-5 text-sky-600 dark:text-sky-400" />
          <span className="text-sky-600 dark:text-sky-400">Pending</span>
        </span>
      )
    case "APPROVED":
      return (
        <span className="flex items-center gap-2">
          <CircleCheckBig className="size-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-emerald-600 dark:text-emerald-400">
            Approved
          </span>
        </span>
      )
    case "REJECTED":
      return (
        <span className="flex items-center gap-2">
          <CircleX className="text-destructive size-5" />
          <span className="text-destructive">Rejected</span>
        </span>
      )
  }
}

interface DetailsModalProps {
  request: AccessRequest
  loadAccessRequests: () => Promise<void>
}

export function DetailsModal({
  request,
  loadAccessRequests,
}: DetailsModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<AccessRequestStatus | undefined>(
    undefined,
  )

  const form = useForm<z.infer<typeof UpdateAccessRequestSchema>>({
    resolver: zodResolver(UpdateAccessRequestSchema),
    defaultValues: {
      id: request.id,
      status: request.status,
    },
  })

  async function handleSubmit(
    values: z.infer<typeof UpdateAccessRequestSchema>,
  ) {
    if (status === values.status) return

    try {
      await updateAccessRequest(values)
      toast.success("Success", {
        description: `Access request has been ${values.status === "PENDING" ? "set to Pending" : values.status}.`,
      })
      setStatus(values.status)
      loadAccessRequests()
    } catch (error) {
      console.error("Failed to change status:", error)
      toast.error("Error", {
        description: `Failed to change status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      })
    }
  }

  const pending = form.formState.isSubmitting

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={isOpen}
          onClick={(prev) => setIsOpen(!prev)}
          size="icon"
          variant="outline"
        >
          <Edit className="size-4" />
          <span className="sr-only">Edit Access Request</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Access Request Details</DialogTitle>
          <DialogDescription>
            Here you can view and update the status of the access request. After
            saving changes, the user will be notified of the status change via
            email.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label className="text-sm font-medium">Name</Label>
          <Input disabled value={request.name} />
        </div>
        <div>
          <Label className="text-sm font-medium">Email</Label>
          <Input disabled value={request.email} />
        </div>
        <div>
          <Label className="text-sm font-medium">Reason</Label>
          <Textarea
            disabled
            value={request.reason ?? "No reason provided"}
            rows={4}
            className="resize-none"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Requested At</Label>
          <Input
            disabled
            value={new Date(request.createdAt).toLocaleString()}
          />
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => <input type="hidden" {...field} />}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Status</FormLabel>
                  <Select
                    disabled={pending}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(AccessRequestStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {formatStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <div className="flex w-full items-center justify-between">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button disabled={pending} type="submit" variant="secondary">
                  {pending ? (
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
      </DialogContent>
    </Dialog>
  )
}
