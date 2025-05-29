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
