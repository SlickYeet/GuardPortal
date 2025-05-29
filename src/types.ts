export type User = {
  id: string
  name: string
  email: string
  image: string
  emailVerified: boolean
  isFirstLogin: boolean
  config?: PeerConfig | null
}

export type PeerConfig = {
  id: string
  name: string
  allowedIPs: string
  endpoint: string
  dns: string
  configuration: Configuration
}

export type Configuration = {
  name: string
  address: string
  listenPort: string
}

export type UserWithConfig = User & {
  config?: PeerConfig | null
}

export type PeerConfigWithUser = PeerConfig & {
  user: User
}
