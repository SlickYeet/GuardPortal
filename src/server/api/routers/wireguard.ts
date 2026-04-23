import { TRPCError } from "@trpc/server"
import { eq, getTableColumns } from "drizzle-orm"
import * as z from "zod"

import { env } from "@/env"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { peerConfigTable, user as userTable } from "@/server/db/schema"

export const wireguardRouter = createTRPCRouter({
  getPeerConfigByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({
          ...getTableColumns(userTable),
          peerConfig: {
            ...getTableColumns(peerConfigTable),
          },
        })
        .from(userTable)
        .leftJoin(peerConfigTable, eq(peerConfigTable.userId, userTable.id))
        .where(eq(userTable.id, input.userId))

      if (!user?.peerConfig) return null

      return user.peerConfig
    }),

  getPeerConfigs: protectedProcedure.query(async () => {
    const reqOpts: RequestInit = {
      headers: {
        "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
      },
      method: "GET",
      redirect: "follow",
    }

    const res = await fetch(
      `${env.WIREGUARD_API_ENDPOINT}/downloadAllPeers/wg0`,
      reqOpts,
    )

    if (!res.ok) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Failed to fetch WireGuard peer configs: ${res.statusText}`,
      })
    }

    const json = await res.json()

    return json.data.map((peer: { file: string; fileName: string }) => ({
      config: peer.file,
      name: peer.fileName,
    }))
  }),
})
