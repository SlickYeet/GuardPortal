import { env } from "@/env"

export function formatPeerConfigName(name: string): string {
  if (name.startsWith("dev:") || name.startsWith("prod:")) {
    return name
  }
  const suffix = "'s Config"
  const baseName = name.endsWith(suffix) ? name : `${name}${suffix}`
  const prefix = env.NODE_ENV === "production" ? "prod:" : "dev:"
  return `${prefix}${baseName}`
}
