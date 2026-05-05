import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse } from "@/lib/types"

export type RolesQuery = {
  page?: number
  limit?: number
  search?: string
}

export type RoleListItem = {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export type RoleDetailItem = RoleListItem & {
  permissions?: Array<{ id: string; code: string; description?: string | null }>
}

export type CreateRolePayload = {
  name: string
  description?: string
  permissionIds?: string[]
}

export type UpdateRolePayload = {
  name?: string
  description?: string
  permissionIds?: string[]
}

export const roles = {
  getAll: (query?: RolesQuery) =>
    api.get<ApiResponse<PaginatedResponse<RoleListItem>>>("/roles", {
      params: query,
    }),
  getById: (id: string) => api.get<ApiResponse<RoleDetailItem>>(`/roles/${id}`),
  create: (payload: CreateRolePayload) => api.post<ApiResponse<RoleDetailItem>>("/roles", payload),
  update: (id: string, payload: UpdateRolePayload) => api.patch<ApiResponse<RoleDetailItem>>(`/roles/${id}`, payload),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/roles/${id}`),
}
