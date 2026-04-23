export function parsePeerConfigName(configName: string): string {
  return configName.replace("dev:", "").replace("prod:", "")
}
