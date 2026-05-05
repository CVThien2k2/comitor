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
  } | null
  agentLevel: {
    id: string
    code: string
    description: string
  } | null
}

export type CreateUserPayload = {
  name: string
  email: string
  username: string
  password: string
  phone?: string
  roleId?: string
  agentLevelId: string
}

export type UpdateUserPayload = {
  name?: string
  email?: string
  phone?: string
  avatarUrl?: string
  roleId?: string
  agentLevelId?: string
  isActive?: boolean
}

export const users = {
  getAll: (query?: UsersQuery) =>
    api.get<ApiResponse<PaginatedResponse<UserListItem>>>("/users", {
      params: query,
    }),
  create: (payload: CreateUserPayload) => api.post<ApiResponse<UserProfile>>("/users", payload),
  update: (id: string, payload: UpdateUserPayload) => api.patch<ApiResponse<UserProfile>>(`/users/${id}`, payload),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/users/${id}`),
}
