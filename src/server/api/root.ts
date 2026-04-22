import { createCallerFactory, createTRPCRouter } from "@/server/api/init"

export const appRouter = createTRPCRouter({
  // routers
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
