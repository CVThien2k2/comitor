import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsString, IsOptional, IsUUID, IsArray, ValidateNested } from "class-validator"

class CreateAttachmentDto {
  @ApiProperty({ example: "photo.jpg", required: false })
  @IsString()
  @IsOptional()
  fileName?: string

  @ApiProperty({ example: "image", required: false })
  @IsString()
  @IsOptional()
  fileType?: string

  @ApiProperty({ example: "https://storage.comitor.io/images/photo.jpg" })
  @IsString()
  fileUrl: string

  @ApiProperty({ example: null, required: false })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string

  @ApiProperty({ example: "image/jpeg", required: false })
  @IsString()
  @IsOptional()
  fileMimeType?: string

  @ApiProperty({ example: "uploads/photo.jpg", required: false })
  @IsString()
  @IsOptional()
  key?: string
}

export class CreateMessageDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  conversationId: string

  @ApiProperty({ example: "Xin chào!", required: false })
  @IsString()
  @IsOptional()
  content?: string

  @ApiProperty({ type: [CreateAttachmentDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentDto)
  @IsOptional()
  attachments?: CreateAttachmentDto[]
}
