import type { User } from "@workspace/database"

export type UserProfile = Omit<User, "password">

export interface AuthResponse {
  accessToken: string
  accessExpiresAt: number
  user: UserProfile
}
