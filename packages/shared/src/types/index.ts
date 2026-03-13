import type { UserRole } from "../enums/index"

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
}

export interface UserProfile {
  id: string
  email: string
  avatarUrl: string
  role: UserRole
}
