import { api } from "@/lib/axios"
import type { ApiResponse, UserProfile } from "@workspace/shared"

export const users = {
  getMe: () => api.get<ApiResponse<UserProfile>>("/users/me"),
}
