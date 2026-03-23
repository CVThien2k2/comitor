import { api } from "@/lib/axios"
import type { ApiResponse, UserProfile } from "@workspace/shared"

export type AppData = {
  badges: {
    conversationsUnreadCount: number
  }
}

export const app = {
  init: () => api.post<ApiResponse<AppData & { user: UserProfile }>>("/init"),
}
