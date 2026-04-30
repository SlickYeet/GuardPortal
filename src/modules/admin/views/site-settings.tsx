"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { SaveIcon, Settings2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type * as z from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api/client"
import { siteSettingsUpdateSchema } from "@/modules/admin/schema/site-settings"

export function SiteSettingsView() {
  const utils = api.useUtils()
  const router = useRouter()

  const [siteSettings] = api.siteSettings.get.useSuspenseQuery()

  const { id, updatedAt, ...defaultValues } = siteSettings
  void id
  void updatedAt

  const form = useForm<z.infer<typeof siteSettingsUpdateSchema>>({
    defaultValues,
    resolver: zodResolver(siteSettingsUpdateSchema),
  })

  const updateSiteSettings = api.admin.siteSettings.update.useMutation({
    onError(error) {
      toast.error("Something went wrong", {
        description: error.message,
      })
    },
    onSuccess(updatedSettings) {
      toast.success("Site settings updated successfully")
      void utils.siteSettings.get.invalidate()
      const {
        id: updatedId,
        updatedAt: updatedAtValue,
        ...nextValues
      } = updatedSettings
      void updatedId
      void updatedAtValue
      form.reset(nextValues)
      router.refresh()
    },
  })

  function onSubmit(data: z.infer<typeof siteSettingsUpdateSchema>) {
    updateSiteSettings.mutate(data)
  }

  const isPending = form.formState.isSubmitting || updateSiteSettings.isPending

  return (
    <Card>
      <CardHeader className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-y-1">
          <CardTitle className="flex items-center gap-2">
            <Settings2Icon className="size-5" /> Site Settings
          </CardTitle>
          <CardDescription>
            Configure branding, support links, and site-wide behavior.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6" variant="info">
          <AlertTitle>
            These settings apply immediately across the site.
          </AlertTitle>
          <AlertDescription>
            Changes here control the values used in metadata, dashboard links,
            QR fallbacks, and admin defaults.
          </AlertDescription>
        </Alert>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={form.control}
                name="appName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>App Name</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                      id={field.name}
                      placeholder="Enter app name"
                    />
                    <FieldDescription>
                      Used in headers, metadata, and auth screens.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="defaultFetchLimit"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Default Fetch Limit
                    </FieldLabel>
                    <Input
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                      id={field.name}
                      max={100}
                      min={1}
                      onChange={(event) => {
                        const value = event.target.value
                        field.onChange(value ? Number(value) : 0)
                      }}
                      placeholder="10"
                      type="number"
                      value={field.value}
                    />
                    <FieldDescription>
                      Controls how many rows are loaded for admin tables.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="appDescription"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>App Description</FieldLabel>
                  <Textarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                    id={field.name}
                    placeholder="Describe the site"
                    rows={3}
                  />
                  <FieldDescription>
                    Used for the browser metadata and social previews.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={form.control}
                name="discordUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Discord URL</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                      id={field.name}
                      placeholder="https://discord.gg/..."
                    />
                    <FieldDescription>
                      Used by the support button on the dashboard.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="fallbackQrUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Fallback QR URL
                    </FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                      id={field.name}
                      placeholder="https://example.com/fallback"
                    />
                    <FieldDescription>
                      Shown when a user has no VPN configuration yet.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="announcementEnabled"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  orientation="horizontal"
                >
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>
                      Announcement Banner
                    </FieldLabel>
                    <FieldDescription>
                      Show a site-wide banner at the top of every page.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                  <Switch
                    aria-invalid={fieldState.invalid}
                    checked={field.value ?? false}
                    disabled={isPending}
                    id={field.name}
                    name={field.name}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="announcementMessage"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Announcement Message
                  </FieldLabel>
                  <Textarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                    id={field.name}
                    placeholder="Optional site-wide message"
                    rows={3}
                  />
                  <FieldDescription>
                    Leave blank if you only want the maintenance banner.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="maintenanceMode"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  orientation="horizontal"
                >
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>
                      Maintenance Mode
                    </FieldLabel>
                    <FieldDescription>
                      Display a maintenance warning banner across the site.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                  <Switch
                    aria-invalid={fieldState.invalid}
                    checked={field.value ?? false}
                    disabled={isPending}
                    id={field.name}
                    name={field.name}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />

            <div className="flex items-center justify-end gap-2">
              <Button disabled={isPending} type="submit">
                {isPending ? <Spinner /> : <SaveIcon />}
                Save Changes
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
