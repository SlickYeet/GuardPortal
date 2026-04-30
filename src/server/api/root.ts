import { adminRouter } from "@/modules/admin/server/api/admin"
import { createCallerFactory, createTRPCRouter } from "@/server/api/init"
import { siteSettingsRouter } from "@/server/api/routers/site-settings"
import { wireguardRouter } from "@/server/api/routers/wireguard"

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  siteSettings: siteSettingsRouter,
  wireguard: wireguardRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
