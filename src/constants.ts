import { env } from "@/env"

export const APP_NAME = "GuardPortal"
export const APP_DESCRIPTION = "An open-source WireGuard VPN client portal."

export const DISCORD_URL = env.NEXT_PUBLIC_DISCORD_URL

export const FALLBACK_QR_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

export const DEFAULT_FETCH_LIMIT = 10

export const SITE_SETTINGS_ID = "global"

export const DEFAULT_SITE_ANNOUNCEMENT_ENABLED = false
export const DEFAULT_SITE_ANNOUNCEMENT_MESSAGE = ""

export const DEFAULT_SITE_MAINTENANCE_MODE = false

export const DEFAULT_SITE_SETTINGS = {
  announcementEnabled: DEFAULT_SITE_ANNOUNCEMENT_ENABLED,
  announcementMessage: DEFAULT_SITE_ANNOUNCEMENT_MESSAGE,
  appDescription: APP_DESCRIPTION,
  appName: APP_NAME,
  defaultFetchLimit: DEFAULT_FETCH_LIMIT,
  discordUrl: DISCORD_URL,
  fallbackQrUrl: FALLBACK_QR_URL,
  maintenanceMode: DEFAULT_SITE_MAINTENANCE_MODE,
} as const
