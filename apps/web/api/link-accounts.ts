import { api } from "@/lib/axios"
import type { ApiResponse, LinkAccountItem, PaginatedResponse } from "@/lib/types"

export type ConnectZaloOaPayload = {
  code: string
  oaId: string
}

export type ConnectMetaPayload = {
  code: string
}

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
  getAll: async (query?: LinkAccountQuery) =>
    await api.get<ApiResponse<PaginatedResponse<LinkAccountItem>>>("/link-accounts", { params: query }),

  loginZalo: () => api.get<ApiResponse<ZaloLoginQr>>("/platform/zalo/login"),

  connectZaloOa: (payload: ConnectZaloOaPayload) => api.post<ApiResponse>("/platform/zalo-oa/callback", payload),

  connectMeta: (payload: ConnectMetaPayload) => api.post<ApiResponse>("/platform/meta/callback", payload),
}
