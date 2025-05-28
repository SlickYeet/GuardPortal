export type UserWithConfig = {
  id: string
  name: string
  email: string
  config: {
    id: string
    config: string
  }
}

export type PeerConfigWithUser = {
  id: string
  name: string
  config: string
  user: {
    id: string
    name: string
    email: string
    image: string
  }
}
