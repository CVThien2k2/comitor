import { api } from "@/lib/axios"
import type { ApiResponse, PresignedData } from "@workspace/shared"

export type PresignOnePayload = {
  folder: string
  filename: string
  contentType: string
}

export type PresignBatchPayload = {
  folder: string
  files: Array<{ filename: string; contentType: string }>
}

export type DeleteOnePayload = {
  key: string
}

export type DeleteBatchPayload = {
  keys: Array<{ key: string }>
}

export const uploadApi = {
  presign: (payload: PresignOnePayload) => api.post<ApiResponse<PresignedData>>("/upload/presign", payload),
  presignBatch: (payload: PresignBatchPayload) =>
    api.post<ApiResponse<PresignedData[]>>("/upload/presign-batch", payload),
  deleteFile: (payload: DeleteOnePayload) => api.post<ApiResponse<null>>("/upload/delete", payload),
  deleteBatch: (payload: DeleteBatchPayload) => api.post<ApiResponse<null>>("/upload/delete-batch", payload),
}
