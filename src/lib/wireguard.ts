import { Configuration, PeerConfig } from "@/generated/prisma"

export function parsePeerConfig(config: string) {
  function parseSection(section: string): Record<string, string> {
    const result: Record<string, string> = {}
    section.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w\d]+)\s*=\s*(.+)\s*$/)
      if (match) {
        result[match[1]] = match[2]
      }
    })
    return result
  }

  const sectionRegex = /\[([^\]]+)\]([\s\S]*?)(?=\n\[|$)/g
  let match
  const configObj: Record<string, Record<string, string>> = {}

  while ((match = sectionRegex.exec(config)) !== null) {
    const sectionName = match[1].trim()
    const sectionBody = match[2].trim()
    configObj[sectionName] = parseSection(sectionBody)
  }

  return configObj
}

export type PeerConfigWithConfiguration = PeerConfig & {
  configuration: Configuration
}

export function peerConfigToWgConfig(
  config: PeerConfigWithConfiguration,
): string {
  return `[Interface]
PrivateKey = ${config.privateKey}
Address = ${config.allowedIPs}
MTU = ${config.mtu}
DNS = ${config.dns}

[Peer]
PublicKey = ${config.configuration?.publicKey}
AllowedIPs = ${config.endpointAllowedIP}
Endpoint = ${config.endpoint}
PersistentKeepalive = ${config.keepAlive}
${config.preSharedKey ? `PresharedKey = ${config.preSharedKey}` : ""}
`
}
