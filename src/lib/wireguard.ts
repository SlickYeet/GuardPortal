export function parsePeerConfig(config: string) {
  try {
    const parsed = JSON.parse(config)
    const obj = Array.isArray(parsed) ? parsed[0] : parsed

    return {
      server: obj.remote_endpoint ?? obj.endpoint ?? "",
      allowedIPs:
        obj.allowed_ip ??
        obj.endpoint_allowed_ip ??
        obj.configuration?.Address ??
        "",
      dns: obj.DNS ?? "",
    }
  } catch {
    const endpointMatch = config.match(/Endpoint\s*=\s*(.+)/)
    const allowedIPsMatch = config.match(/AllowedIPs?\s*=\s*(.+)/)
    const addressMatch = config.match(/Address\s*=\s*(.+)/)
    const dnsMatch = config.match(/DNS\s*=\s*(.+)/)

    return {
      server: endpointMatch?.[1] ?? "",
      allowedIPs: allowedIPsMatch?.[1] ?? addressMatch?.[1] ?? "",
      dns: dnsMatch?.[1] ?? "",
    }
  }
}
