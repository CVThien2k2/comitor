import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, SuggestedMessageItem } from "@workspace/shared"

export type { SuggestedMessageItem } from "@workspace/shared"

export interface SuggestedMessagesPaginationQuery {
  page?: number
  limit?: number
  search?: string
}

export interface CreateSuggestedMessagePayload {
  tag: string
  message: string
  images?: string[]
}

export interface UpdateSuggestedMessagePayload {
  tag?: string
  message?: string
  images?: string[]
}

export const suggestedMessages = {
  getAll: (query?: SuggestedMessagesPaginationQuery) =>
    api.get<ApiResponse<PaginatedResponse<SuggestedMessageItem>>>("/suggested-messages", { params: query }),
  create: (payload: CreateSuggestedMessagePayload) =>
    api.post<ApiResponse<SuggestedMessageItem>>("/suggested-messages", payload),
  update: (id: string, payload: UpdateSuggestedMessagePayload) =>
    api.patch<ApiResponse<SuggestedMessageItem>>(`/suggested-messages/${id}`, payload),
  remove: (id: string) => api.delete<ApiResponse<void>>(`/suggested-messages/${id}`),
}
