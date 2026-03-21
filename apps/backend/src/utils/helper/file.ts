export async function streamToBuffer(stream: AsyncIterable<Uint8Array>) {
  const chunks: Buffer[] = []

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  return Buffer.concat(chunks)
}

// Hàm convert stream thành blob để upload lên ZaloOA hoặc các nền tảng khác nếu cần
export async function streamToBlob(stream: AsyncIterable<Uint8Array>, contentType?: string) {
  const buffer = await streamToBuffer(stream)

  return new Blob([buffer], {
    type: contentType || "application/octet-stream",
  })
}
