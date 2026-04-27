import { api } from "@/lib/axios"
import type { ApiResponse, LinkAccountItem, LinkAccountStats, PaginatedResponse } from "@/lib/types"
import type { ChannelType, LinkAccountStatus } from "@workspace/database"

export type ConnectZaloOaPayload = {
  code: string
  oaId: string
}

export type ConnectMetaPayload = {
  code: string
}

export type UpdateLinkAccountPayload = {
  displayName?: string
  avatarUrl?: string
  status?: LinkAccountStatus
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
  provider?: ChannelType
}

export const linkAccounts = {
  getAll: async (query?: LinkAccountQuery) =>
    await api.get<ApiResponse<PaginatedResponse<LinkAccountItem>>>("/link-accounts", { params: query }),
  getStats: async () => await api.get<ApiResponse<LinkAccountStats>>("/link-accounts/stats"),

  update: (id: string, payload: UpdateLinkAccountPayload) =>
    api.patch<ApiResponse<LinkAccountItem>>(`/link-accounts/${id}`, payload),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/link-accounts/${id}`),

  disconnect: (id: string) => api.post<ApiResponse<LinkAccountItem>>(`/link-accounts/${id}/disconnect`),

  reconnect: (id: string) => api.post<ApiResponse<LinkAccountItem>>(`/link-accounts/${id}/reconnect`),

  loginZalo: () => api.get<ApiResponse<ZaloLoginQr>>("/platform/zalo/login"),

  connectZaloOa: (payload: ConnectZaloOaPayload) => api.post<ApiResponse>("/platform/zalo-oa/callback", payload),

  connectMeta: (payload: ConnectMetaPayload) => api.post<ApiResponse>("/platform/meta/callback", payload),
}
