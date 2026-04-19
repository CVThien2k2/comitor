import type { PresignedData } from "@/lib/types"
import { uploadApi } from "@/api/upload"

export type UploadProgress = {
  loaded: number
  total: number
  percent: number
}

function putToPresignedUrl(params: {
  uploadUrl: string
  file: Blob
  contentType: string
  onProgress?: (p: UploadProgress) => void
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", params.uploadUrl, true)
    xhr.setRequestHeader("Content-Type", params.contentType)

    xhr.upload.onprogress = (evt) => {
      if (!params.onProgress) return
      const total = evt.total || params.file.size || 0
      const loaded = evt.loaded
      const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0
      params.onProgress({ loaded, total, percent })
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve()
      reject(new Error(`Upload thất bại (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error("Upload thất bại (network error)"))
    xhr.onabort = () => reject(new Error("Upload bị hủy"))

    xhr.send(params.file)
  })
}

export async function uploadOneImage(params: {
  folder: string
  file: File
}): Promise<PresignedData> {
  const res = await uploadApi.presign({
    folder: params.folder,
    filename: params.file.name,
    contentType: params.file.type || "application/octet-stream",
  })
  if (!res.data) throw new Error("Không tạo được presigned URL")

  await putToPresignedUrl({
    uploadUrl: res.data.uploadUrl,
    file: params.file,
    contentType: params.file.type || "application/octet-stream",
  })

  return res.data
}

export async function uploadOneImageWithProgress(params: {
  folder: string
  file: File
  onProgress: (p: UploadProgress) => void
}): Promise<PresignedData> {
  const res = await uploadApi.presign({
    folder: params.folder,
    filename: params.file.name,
    contentType: params.file.type || "application/octet-stream",
  })
  if (!res.data) throw new Error("Không tạo được presigned URL")

  await putToPresignedUrl({
    uploadUrl: res.data.uploadUrl,
    file: params.file,
    contentType: params.file.type || "application/octet-stream",
    onProgress: params.onProgress,
  })

  return res.data
}

async function runWithConcurrency<T>(items: T[], concurrency: number, worker: (item: T, index: number) => Promise<void>) {
  const limit = Math.max(1, Math.floor(concurrency))
  let next = 0

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const idx = next++
      await worker(items[idx]!, idx)
    }
  })

  await Promise.all(runners)
}

export async function uploadManyImages(params: {
  folder: string
  files: File[]
  concurrency?: number
}): Promise<PresignedData[]> {
  const res = await uploadApi.presignBatch({
    folder: params.folder,
    files: params.files.map((f) => ({
      filename: f.name,
      contentType: f.type || "application/octet-stream",
    })),
  })
  const presignedList = res.data ?? []
  if (presignedList.length !== params.files.length) {
    throw new Error("Danh sách presigned URL không khớp số lượng file")
  }

  await runWithConcurrency(params.files, params.concurrency ?? 3, async (file, idx) => {
    const presigned = presignedList[idx]!
    await putToPresignedUrl({
      uploadUrl: presigned.uploadUrl,
      file,
      contentType: file.type || "application/octet-stream",
    })
  })

  return presignedList
}

export async function uploadManyImagesWithProgress(params: {
  folder: string
  files: File[]
  concurrency?: number
  onFileProgress?: (info: { index: number; file: File; progress: UploadProgress }) => void
  onTotalProgress?: (p: UploadProgress) => void
}): Promise<PresignedData[]> {
  const totalBytes = params.files.reduce((sum, f) => sum + (f.size || 0), 0)
  const perFileLoaded = new Array(params.files.length).fill(0) as number[]

  const emitTotal = () => {
    if (!params.onTotalProgress) return
    const loaded = perFileLoaded.reduce((s, v) => s + v, 0)
    const total = totalBytes
    const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0
    params.onTotalProgress({ loaded, total, percent })
  }

  const res = await uploadApi.presignBatch({
    folder: params.folder,
    files: params.files.map((f) => ({
      filename: f.name,
      contentType: f.type || "application/octet-stream",
    })),
  })
  const presignedList = res.data ?? []
  if (presignedList.length !== params.files.length) {
    throw new Error("Danh sách presigned URL không khớp số lượng file")
  }

  await runWithConcurrency(params.files, params.concurrency ?? 3, async (file, idx) => {
    const presigned = presignedList[idx]!
    await putToPresignedUrl({
      uploadUrl: presigned.uploadUrl,
      file,
      contentType: file.type || "application/octet-stream",
      onProgress: (p) => {
        perFileLoaded[idx] = p.loaded
        params.onFileProgress?.({ index: idx, file, progress: p })
        emitTotal()
      },
    })
    perFileLoaded[idx] = file.size
    emitTotal()
  })

  return presignedList
}

