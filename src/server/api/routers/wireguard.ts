import { TRPCError } from "@trpc/server"

import { env } from "@/env"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"

export const wireguardRouter = createTRPCRouter({
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
