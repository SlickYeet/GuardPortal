import { DEFAULT_SITE_SETTINGS, SITE_SETTINGS_ID } from "@/constants"
import { createTRPCRouter, publicProcedure } from "@/server/api/init"
import { siteSettingsTable } from "@/server/db/schema"

export const siteSettingsRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const [settings] = await ctx.db.select().from(siteSettingsTable).limit(1)

    if (!settings) {
      return {
        ...DEFAULT_SITE_SETTINGS,
        id: SITE_SETTINGS_ID,
        updatedAt: new Date(0),
      }
    }

    return settings
  }),
})
