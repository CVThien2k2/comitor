import type { User } from "@workspace/database"
import type { PermissionCode } from "@workspace/database"

export type UserProfile = Omit<User, "password">

export interface AuthResponse {
  accessToken: string
  accessExpiresAt: number
  permissions: PermissionCode[]
  user: UserProfile
}
