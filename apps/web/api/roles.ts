import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse } from "@workspace/shared"

export type RoleItem = {
  id: string
  name: string
  description?: string | null
}

export const roles = {
  list: () => api.get<ApiResponse<PaginatedResponse<RoleItem>>>("/roles"),
}
