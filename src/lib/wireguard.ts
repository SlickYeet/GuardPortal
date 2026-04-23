import { readFile } from "node:fs/promises"
import path from "node:path"

export async function getDefaultPeerConfig() {
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "config",
      "placeholder-peer-config.conf",
    )
    const defaultPeerConfig = await readFile(filePath, "utf-8")
    return defaultPeerConfig
  } catch (error) {
    console.error("Error reading default peer config file:", error)
    throw new Error(error instanceof Error ? error.message : "Unknown error")
  }
}
