import * as z from "zod"

export const wireguardConfig = z.object({
  allowed_ip: z.string(),
  configuration: z.object({
    Address: z.string(),
    ListenPort: z.string(),
    Name: z.string(),
    PrivateKey: z.string(),
    PublicKey: z.string(),
  }),
  DNS: z.string(),
  endpoint: z.string(),
  endpoint_allowed_ip: z.string(),
  id: z.string(),
  keepalive: z.number(),
  mtu: z.number(),
  name: z.string(),
  preshared_key: z.string(),
  private_key: z.string(),
})
export type WireguardConfig = z.infer<typeof wireguardConfig>
