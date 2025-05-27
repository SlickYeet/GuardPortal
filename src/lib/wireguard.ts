export function parsePeerConfig(configJson: string) {
  const configArr = JSON.parse(configJson)
  if (!Array.isArray(configArr) || configArr.length === 0) {
    throw new Error("Invalid config: not an array or empty")
  }
  const config = configArr[0]

  return {
    server: config.remote_endpoint ?? "",
    allowedIPs: config.allowed_ip ?? config.endpoint_allowed_ip ?? "",
    dns: config.DNS ?? "",
    name: config.name ?? "",
    publicKey: config.configuration?.PublicKey ?? "",
    privateKey: config.private_key ?? "",
    mtu: config.mtu ?? "",
    keepalive: config.keepalive ?? "",
    status: config.status ?? "",
    address: config.configuration?.Address ?? "",
    listenPort: config.configuration?.ListenPort ?? "",
  }
}
