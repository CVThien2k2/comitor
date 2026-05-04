import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, UserProfile } from "@/lib/types"

export type UsersQuery = {
  page?: number
  limit?: number
  search?: string
}

export type UserListItem = UserProfile & {
  role: {
    id: string
    name: string
  }
}

export const users = {
  getAll: (query?: UsersQuery) =>
    api.get<ApiResponse<PaginatedResponse<UserListItem>>>("/users", {
      params: query,
    }),
}
