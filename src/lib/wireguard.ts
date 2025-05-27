export function parsePeerConfig(config: string) {
  try {
    const parsed = JSON.parse(config)
    const peer = Array.isArray(parsed) ? parsed[0] : parsed
    return {
      server: peer.endpoint ?? "",
      allowedIPs: peer.allowed_ip ?? "",
      dns: peer.DNS ?? "",
    }
  } catch {
    const serverMatch = config.match(/Endpoint\s*=\s*(.+)/)
    const allowedIPsMatch = config.match(/AllowedIPs\s*=\s*(.+)/)
    const dnsMatch = config.match(/DNS\s*=\s*(.+)/)

    return {
      server: serverMatch?.[1] ?? "",
      allowedIPs: allowedIPsMatch?.[1] ?? "",
      dns: dnsMatch?.[1] ?? "",
    }
  }
}
