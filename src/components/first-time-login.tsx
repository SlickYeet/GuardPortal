"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "better-auth"
import { Key, Loader2, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { updateUserPasswordAndVerifyEmail } from "@/actions/user"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FirstTimeLoginSchema } from "@/schemas/auth"

interface FirstTimeLoginProps {
  user: User
}

export function FirstTimeLogin({ user }: FirstTimeLoginProps) {
  const form = useForm<z.infer<typeof FirstTimeLoginSchema>>({
    resolver: zodResolver(FirstTimeLoginSchema),
    defaultValues: {
      email: user.email,
      password: "",
      confirmPassword: "",
    },
  })

  async function handleSubmit(values: z.infer<typeof FirstTimeLoginSchema>) {
    try {
      const validatedData = FirstTimeLoginSchema.parse(values)
      const res = await updateUserPasswordAndVerifyEmail(validatedData)
      if (!res.success) {
        toast.error(res.message || "Failed to update password.")
        return
      }
      toast.success("Your account has been set up successfully!")
    } catch (error) {
      console.error("Error during first-time login:", error)
      toast.error(
        "An error occurred while setting up your account. Please try again.",
      )
    }
  }

  const pending = form.formState.isSubmitting

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-primary text-3xl font-bold">
            Welcome, {user.name || user.email}!
          </h1>
          <p className="text-muted-foreground mt-2">
            It looks like this is your first time logging in. Please set up your
            account by creating a password.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              First Time Login
            </CardTitle>
            <CardDescription>
              Remember to create a string password that is at least 12
              characters long, and that you can remember.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => <input type="hidden" {...field} />}
                />
                <div className="flex flex-col items-start gap-4 sm:flex-row">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Password</FormLabel>
                        <Input
                          type="password"
                          placeholder="************"
                          {...field}
                        />
                        <FormDescription>
                          Please create a strong password that is at least 12
                          characters long, contains uppercase and lowercase
                          letters, numbers, and special characters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Confirm Password</FormLabel>
                        <Input
                          type="password"
                          placeholder="************"
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  disabled={pending}
                  type="submit"
                  size="lg"
                  className="w-full"
                >
                  {pending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Setting up account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-4" />
                      <span>Finish Account Setup</span>
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
