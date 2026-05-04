import { api } from "@/lib/axios"
import type {
  ApiResponse,
  GoldenProfileDetail,
  GoldenProfileRecord,
  PaginatedResponse,
  UpdateGoldenProfilePayload,
} from "@/lib/types"

export type GoldenProfilesQuery = {
  page?: number
  limit?: number
  search?: string
}

export type { GoldenProfileDetail, GoldenProfileRecord, UpdateGoldenProfilePayload } from "@/lib/types"

export const goldenProfiles = {
  getAll: (query?: GoldenProfilesQuery) =>
    api.get<ApiResponse<PaginatedResponse<GoldenProfileRecord>>>("/golden-profiles", {
      params: query,
    }),

  getById: (id: string) => api.get<ApiResponse<GoldenProfileDetail>>(`/golden-profiles/${id}`),

  update: (id: string, payload: UpdateGoldenProfilePayload) =>
    api.patch<ApiResponse<GoldenProfileRecord>>(`/golden-profiles/${id}`, payload),
}
