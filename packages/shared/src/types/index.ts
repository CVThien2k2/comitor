export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
}

export interface UserProfile {
  id: string
  email: string
  username: string
}
