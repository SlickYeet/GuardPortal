"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, RefreshCcw, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { createRequestAccess } from "@/actions/access-requests"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { RequestAccessSchema } from "@/schemas/request-access"

export function RequestAccessForm() {
  const router = useRouter()

  const [isError, setisError] = useState<boolean>(false)

  const form = useForm<z.infer<typeof RequestAccessSchema>>({
    resolver: zodResolver(RequestAccessSchema),
    defaultValues: {
      name: "",
      email: "",
      reason: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof RequestAccessSchema>) => {
    const response = await createRequestAccess(values)

    if (!response.success) {
      console.error("Failed to send email:", response.message)
      toast.error("Failed to send request:", {
        description: `${response.message || "Unknown error"}`,
        duration: 5000,
      })
      if (response.key === "EMAIL_EXISTS") {
        form.setError("email", {
          type: "manual",
          message:
            response.message || "An error occurred while sending your request.",
        })
        setisError(true)
      }
      return
    }

    toast.success("Your request has been submitted successfully!")
    router.push(
      `/request-access/success${response.data ? `?email=${response.data.email}` : ""}`,
    )
  }

  const pending = form.formState.isSubmitting

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Request Access to HHN VPN</CardTitle>
        <CardDescription>
          Please fill out the form below to request access to the HHN VPN. Your
          request will be reviewed by the network administrators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
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
                  <FormLabel>Your Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason for Access{" "}
                    <span className="text-muted-foreground">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why do you need access to the VPN?"
                      rows={4}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={pending || isError}
              type="submit"
              size="lg"
              className={cn("w-full", isError && "hidden")}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Submit Request</span>
                </>
              )}
            </Button>

            {isError && (
              <Button
                onClick={() => {
                  setisError(false)
                  form.setValue("email", "")
                }}
                size="lg"
                variant="destructive"
                className="w-full"
              >
                <RefreshCcw className="size-4" />
                <span>An error occurred. Click to try again.</span>
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
