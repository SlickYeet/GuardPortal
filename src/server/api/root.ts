import { createCallerFactory, createTRPCRouter } from "@/server/api/init"
import { wireguardRouter } from "@/server/api/routers/wireguard"

export const appRouter = createTRPCRouter({
  wireguard: wireguardRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
