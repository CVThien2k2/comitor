import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, LinkAccountItem, LinkAccountDetail } from "@/lib/types"

export type ZaloLoginQr = {
  sessionId: string
  userId: string
  status: "qr_ready"
  qrCode: string
}
export interface LinkAccountQuery {
  page?: number
  limit?: number
  search?: string
}

export const linkAccounts = {
  getAll: (query?: LinkAccountQuery) =>
    api.get<ApiResponse<PaginatedResponse<LinkAccountItem>>>("/link-accounts", { params: query }),

  getById: (id: string) => api.get<ApiResponse<LinkAccountDetail>>(`/link-accounts/${id}`),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/link-accounts/${id}`),

  update: (id: string, payload: { display_name?: string; status?: string }) =>
    api.patch<ApiResponse<LinkAccountDetail>>(`/link-accounts/${id}`, payload),

  linkZaloOa: (payload: { code: string }) =>
    api.post<ApiResponse<LinkAccountDetail>>("/link-accounts/link/zalo-oa", payload),

  linkMeta: (payload: { code: string }) =>
    api.post<ApiResponse<LinkAccountDetail[]>>("/link-accounts/link/meta-app", payload),
  loginZalo: () => api.get<ApiResponse<ZaloLoginQr>>("/zalo/login"),
}
