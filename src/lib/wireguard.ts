import { readFile } from "fs/promises"
import path from "path"

export async function getStaticPeerConfig() {
  const filePath = path.join(process.cwd(), "src", "config", "peer.conf")
  return await readFile(filePath, "utf-8")
}
