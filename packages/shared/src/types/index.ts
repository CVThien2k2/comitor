import type { User } from "@workspace/database"

export interface ApiResponse<T = unknown> {
  statusCode: number
  message: string
  data?: T
  errors?: string[]
}

export type UserProfile = Omit<User, "password">

export interface AuthResponse {
  accessToken: string
  accessExpiresAt: number
  user: UserProfile
}
