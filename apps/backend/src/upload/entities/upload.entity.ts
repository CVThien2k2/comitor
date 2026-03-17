import { ApiProperty } from "@nestjs/swagger"

export class PresignedEntity {
  @ApiProperty({
    example: "uploads/avatar-1710401100000-abc-def-ghi.jpg",
    description: "Khóa đối tượng S3",
  })
  key: string

  @ApiProperty({
    example: "https://bucket.s3.ap-southeast-1.amazonaws.com/uploads/avatar-1710401100000-abc-def-ghi.jpg?X-Amz-...",
    description: "URL presigned PUT để upload từ client (hết hạn sau 15 phút)",
  })
  uploadUrl: string

  @ApiProperty({
    example: "https://bucket.s3.ap-southeast-1.amazonaws.com/uploads/avatar-1710401100000-abc-def-ghi.jpg",
    description: "URL công khai của tệp sau khi upload",
  })
  url: string
}
