import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, UserProfile } from "@workspace/shared"

export type CreateUserPayload = {
  name: string
  email: string
  username: string
  password: string
  phone?: string
  roleId: string
}

export type ListUsersQuery = {
  page?: number
  limit?: number
  search?: string
}

export const users = {
  getMe: () => api.get<ApiResponse<UserProfile>>("/users/me"),
  list: (query: ListUsersQuery = {}) =>
    api.get<ApiResponse<PaginatedResponse<UserProfile>>>("/users", { params: query }),
  create: (payload: CreateUserPayload) => api.post<ApiResponse<UserProfile>>("/users", payload),
}
