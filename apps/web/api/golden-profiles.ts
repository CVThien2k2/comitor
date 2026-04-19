import { api } from "@/lib/axios"
import type {
  ApiResponse,
  GoldenProfileDetail,
  GoldenProfileRecord,
  UpdateGoldenProfilePayload,
} from "@/lib/types"

export type { GoldenProfileDetail, GoldenProfileRecord, UpdateGoldenProfilePayload } from "@/lib/types"

export const goldenProfiles = {
  getById: (id: string) => api.get<ApiResponse<GoldenProfileDetail>>(`/golden-profiles/${id}`),

  update: (id: string, payload: UpdateGoldenProfilePayload) =>
    api.patch<ApiResponse<GoldenProfileRecord>>(`/golden-profiles/${id}`, payload),
}
