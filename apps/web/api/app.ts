import { api } from "@/lib/axios"
import type { ApiResponse, UserProfile } from "@/lib/types"

export type AppData = {
  badges: {
    conversationsUnreadCount: number
  }
}

export const app = {
  init: () => api.post<ApiResponse<AppData & { user: UserProfile }>>("/init"),
}
