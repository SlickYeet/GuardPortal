import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseWireguardConfig(config: string) {
  const serverMatch = config.match(/Endpoint\s*=\s*(.+)/)
  const allowedIPsMatch = config.match(/AllowedIPs\s*=\s*(.+)/)
  const dnsMatch = config.match(/DNS\s*=\s*(.+)/)

  return {
    server: serverMatch?.[1] ?? "",
    allowedIPs: allowedIPsMatch?.[1] ?? "",
    dns: dnsMatch?.[1] ?? "",
  }
}
