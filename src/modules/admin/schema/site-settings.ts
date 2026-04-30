import { z } from "zod"

export const siteSettingsSchema = z.object({
  announcementEnabled: z.boolean(),
  announcementMessage: z.string(),
  appDescription: z.string().min(1, "App description is required"),
  appName: z.string().min(1, "App name is required"),
  defaultFetchLimit: z.number().int().min(1).max(100),
  discordUrl: z.url(),
  fallbackQrUrl: z.url(),
  maintenanceMode: z.boolean(),
})

export const siteSettingsUpdateSchema = siteSettingsSchema
