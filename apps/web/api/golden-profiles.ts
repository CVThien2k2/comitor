import { api } from "@/lib/axios"
import type {
  ApiResponse,
  GoldenProfileDetail,
  GoldenProfileRecord,
  UpdateGoldenProfilePayload,
} from "@workspace/shared"

export type { GoldenProfileDetail, GoldenProfileRecord, UpdateGoldenProfilePayload } from "@workspace/shared"

export const goldenProfiles = {
  getById: (id: string) => api.get<ApiResponse<GoldenProfileDetail>>(`/golden-profiles/${id}`),

  update: (id: string, payload: UpdateGoldenProfilePayload) =>
    api.patch<ApiResponse<GoldenProfileRecord>>(`/golden-profiles/${id}`, payload),
}
