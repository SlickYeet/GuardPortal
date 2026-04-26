import type { PeerConfig } from "@/server/db/schema"

export function peerConfigToWGConfig(peerConfig: PeerConfig): string {
  return `[Interface]
PrivateKey = ${peerConfig.privateKey}
Address = ${peerConfig.allowedIP}
MTU = ${peerConfig.mtu}
DNS = ${peerConfig.dns}

[Peer]
PublicKey = ${peerConfig.publicKey}
AllowedIPs = ${peerConfig.endpointAllowedIPs}
Endpoint = ${peerConfig.endpoint}
PersistentKeepalive = ${peerConfig.keepAlive}
${peerConfig.preSharedKey ? `PresharedKey = ${peerConfig.preSharedKey}` : ""}
`
}
