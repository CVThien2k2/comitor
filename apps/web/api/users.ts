import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, UserProfile } from "@workspace/shared"

export type UsersQuery = {
  page?: number
  limit?: number
  search?: string
}

type UserRoleSummary = {
  id: string
  name: string
}

type UserRoleDetail = UserRoleSummary & {
  description: string | null
}

export type UserListItem = UserProfile & {
  role: UserRoleSummary | null
}

export type UserDetail = UserProfile & {
  role: UserRoleDetail | null
}

export type CreateUserPayload = {
  name: string
  email: string
  username: string
  password: string
  phone?: string
  roleId?: string
}

export type UpdateUserPayload = {
  name?: string
  email?: string
  phone?: string
  avatarUrl?: string
  roleId?: string
  isActive?: boolean
}

export const users = {
  getMe: () => api.get<ApiResponse<UserProfile>>("/users/me"),
  getAll: (query?: UsersQuery) =>
    api.get<ApiResponse<PaginatedResponse<UserListItem>>>("/users", {
      params: query,
    }),
  getById: (id: string) => api.get<ApiResponse<UserDetail>>(`/users/${id}`),
  create: (payload: CreateUserPayload) =>
    api.post<ApiResponse<UserProfile>>("/users", payload),
  update: (id: string, payload: UpdateUserPayload) =>
    api.patch<ApiResponse<UserProfile>>(`/users/${id}`, payload),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/users/${id}`),
}
