import "server-only"

import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"

import { env } from "@/env"
import { formatPeerConfigName } from "@/helpers/format-peer-config-name"
import type { WireguardConfig } from "@/modules/admin/schema/config"
import { db } from "@/server/db"
import { peerConfigTable } from "@/server/db/schema"

interface GeneratePeerConfigOpts {
  name: string
  userId: string
}

export async function generatePeerConfig({
  name,
  userId,
}: GeneratePeerConfigOpts) {
  const formattedName = formatPeerConfigName(name)

  const [existingConfig] = await db
    .select()
    .from(peerConfigTable)
    .where(eq(peerConfigTable.name, formattedName))

  /**
   * We return the existing config here, instead of throwing an error
   * to prevent the user creation flow from erroring unnecessarily
   */
  if (existingConfig) return existingConfig

  const reqOpts: RequestInit = {
    body: JSON.stringify({
      name: formattedName,
    }),
    headers: {
      "Content-Type": "application/json",
      "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
    },
    method: "POST",
  }

  const res = await fetch(
    `${env.WIREGUARD_API_ENDPOINT}/addPeers/${env.WIREGUARD_CONFIG_NAME}`,
    reqOpts,
  )

  if (!res.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create peer config from WireGuard",
    })
  }

  const json = await res.json()
  const peer: WireguardConfig = Array.isArray(json.data)
    ? json.data[0]
    : json.data

  const [createdConfig] = await db
    .insert(peerConfigTable)
    .values({
      allowedIPs: peer.allowed_ip,
      configurationAddress: peer.configuration.Address,
      configurationListenPort: parseInt(peer.configuration.ListenPort, 10),
      configurationName: peer.configuration.Name,
      configurationPrivateKey: peer.configuration.PrivateKey,
      configurationPublicKey: peer.configuration.PublicKey,
      dns: peer.DNS,
      endpoint: peer.endpoint,
      endpointAllowedIP: peer.endpoint_allowed_ip,
      id: peer.id,
      keepAlive: peer.keepalive,
      mtu: peer.mtu,
      name: formattedName,
      preSharedKey: peer.preshared_key,
      privateKey: peer.private_key,
      publicKey: peer.id,
      userId,
    })
    .returning()

  return createdConfig
}
