import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse } from "@/lib/types"

export type PermissionsQuery = {
  page?: number
  limit?: number
  search?: string
}

export type PermissionListItem = {
  id: string
  code: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export type UpdatePermissionDescriptionPayload = {
  description: string
}

export const permissions = {
  getAll: (query?: PermissionsQuery) =>
    api.get<ApiResponse<PaginatedResponse<PermissionListItem>>>("/permissions", {
      params: query,
    }),
  updateDescription: (id: string, payload: UpdatePermissionDescriptionPayload) =>
    api.patch<ApiResponse<PermissionListItem>>(`/permissions/${id}`, payload),
}
