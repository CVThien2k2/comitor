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

export const roles = {
  getAll: (query?: RolesQuery) =>
    api.get<ApiResponse<PaginatedResponse<RoleListItem>>>("/roles", {
      params: query,
    }),
}
