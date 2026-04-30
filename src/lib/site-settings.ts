import "server-only"

import { cache } from "react"

import { DEFAULT_SITE_SETTINGS } from "@/constants"
import { db } from "@/server/db"
import { siteSettingsTable } from "@/server/db/schema"

export const getSiteSettings = cache(async () => {
  try {
    const [settings] = await db.select().from(siteSettingsTable).limit(1)

    if (!settings) {
      return {
        ...DEFAULT_SITE_SETTINGS,
        id: "global",
        updatedAt: new Date(0),
      }
    }

    return settings
  } catch {
    // If the database is unavailable during build/prerender, fall back to defaults
    return {
      ...DEFAULT_SITE_SETTINGS,
      id: "global",
      updatedAt: new Date(0),
    }
  }
})
