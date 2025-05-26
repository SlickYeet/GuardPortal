export type UserWithConfig = {
  id: string
  name: string
  email: string
  config: {
    id: string
    config: string
  }
}
