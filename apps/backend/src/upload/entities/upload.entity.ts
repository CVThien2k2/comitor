import { ApiProperty } from "@nestjs/swagger"

export class PresignedEntity {
  @ApiProperty({
    example: "uploads/avatar-1710401100000-abc-def-ghi.jpg",
    description: "S3 object key",
  })
  key: string

  @ApiProperty({
    example: "https://bucket.s3.ap-southeast-1.amazonaws.com/uploads/avatar-1710401100000-abc-def-ghi.jpg?X-Amz-...",
    description: "Presigned PUT URL for client-side upload (expires in 15 minutes)",
  })
  uploadUrl: string

  @ApiProperty({
    example: "https://bucket.s3.ap-southeast-1.amazonaws.com/uploads/avatar-1710401100000-abc-def-ghi.jpg",
    description: "Public URL of the file after upload",
  })
  url: string
}
