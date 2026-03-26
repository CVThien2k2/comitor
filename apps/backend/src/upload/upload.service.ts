import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import type { PresignedData } from "@workspace/shared"
import { randomUUID } from "crypto"
import { Readable } from "stream"

@Injectable()
export class UploadService {
  private readonly s3: S3Client
  private readonly bucket: string
  private readonly region: string

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>("AWS_REGION", "ap-southeast-1")
    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID", ""),
        secretAccessKey: this.configService.get<string>("AWS_SECRET_ACCESS_KEY", ""),
      },
    })
    this.bucket = this.configService.get<string>("AWS_S3_BUCKET", "")
    this.region = region
  }
  async delete(key: string) {
    const command = await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    )
    if (command.$metadata.httpStatusCode !== 204) {
      throw new Error("Xóa tệp thất bại")
    }
    return true
  }

  async deleteBatch(keys: string[]) {
    const results = await Promise.all(
      keys.map((key) => this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key })))
    )
    if (results.some((r) => r.$metadata.httpStatusCode !== 204)) {
      throw new Error("Xóa tệp thất bại")
    }
    return true
  }

  buildObjectKey(params: { folder: string; filename: string; prefix?: string }) {
    const { folder, filename, prefix } = params
    const ext = filename.includes(".") ? filename.substring(filename.lastIndexOf(".")) : ""
    const base = filename
      .replace(ext, "")
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
    const name = `${prefix ? `${prefix}-` : ""}${base}-${Date.now()}-${randomUUID()}${ext}`
    return `${folder.replace(/\/$/, "")}/${name}`
  }

  getPublicUrl(key: string) {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
  }

  async getStream(key: string) {
    const response = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    )

    if (!(response.Body instanceof Readable)) {
      throw new Error("Lấy dữ liệu từ S3 không thành công")
    }

    return {
      stream: response.Body,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      name: key.split("/").pop() || "file",
    }
  }

  async getPresignedPutUrl(params: { folder: string; filename: string; contentType: string }): Promise<PresignedData> {
    const key = this.buildObjectKey({
      folder: params.folder,
      filename: params.filename,
    })
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: params.contentType,
    })
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 900 })
    return { key, uploadUrl, url: this.getPublicUrl(key) }
  }

  async getPresignedPutUrlsBatch(params: {
    folder: string
    files: Array<{ filename: string; contentType: string }>
  }): Promise<PresignedData[]> {
    return Promise.all(
      params.files.map(async (file) => {
        const key = this.buildObjectKey({
          folder: params.folder,
          filename: file.filename,
        })
        const command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          ContentType: file.contentType,
        })
        const uploadUrl = await getSignedUrl(this.s3, command, {
          expiresIn: 900,
        })
        return { key, uploadUrl, url: this.getPublicUrl(key) }
      })
    )
  }
}
