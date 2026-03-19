import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, LinkAccountItem, LinkAccountDetail } from "@workspace/shared"

export interface LinkAccountQuery {
  page?: number
  limit?: number
  search?: string
}

export const linkAccounts = {
  getAll: (query?: LinkAccountQuery) =>
    api.get<ApiResponse<PaginatedResponse<LinkAccountItem>>>("/link-accounts", { params: query }),

  getById: (id: string) =>
    api.get<ApiResponse<LinkAccountDetail>>(`/link-accounts/${id}`),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/link-accounts/${id}`),

  linkZaloOa: (payload: { code: string }) =>
    api.post<ApiResponse<LinkAccountDetail>>("/link-accounts/link/zalo-oa", payload),

  linkMeta: (payload: { code: string }) =>
    api.post<ApiResponse<LinkAccountDetail[]>>("/link-accounts/link/meta-app", payload),
}
