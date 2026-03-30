import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

class ZaloOASenderDto {
  @ApiProperty({ example: "user_zalo_id_123" })
  id: string

  @ApiPropertyOptional({ example: "admin_id_001" })
  admin_id?: string
}

class ZaloOARecipientDto {
  @ApiProperty({ example: "oa_id_456" })
  id: string
}

class ZaloOAAttachmentPayloadDto {
  @ApiPropertyOptional({ example: "https://example.com/image.jpg" })
  url?: string

  @ApiPropertyOptional({ example: "https://example.com/thumb.jpg" })
  thumbnail?: string

  @ApiPropertyOptional({ example: "document.pdf" })
  name?: string

  @ApiPropertyOptional({ example: "1048576" })
  size?: string

  @ApiPropertyOptional({ example: "abc123" })
  checksum?: string

  @ApiPropertyOptional({ example: "application/pdf" })
  type?: string

  @ApiPropertyOptional({ example: "sticker_id_001" })
  id?: string
}

class ZaloOAAttachmentDto {
  @ApiProperty({ example: "image", enum: ["image", "file", "sticker"] })
  type: "image" | "file" | "sticker"

  @ApiProperty({ type: ZaloOAAttachmentPayloadDto })
  payload: ZaloOAAttachmentPayloadDto
}

class ZaloOAMessageContentDto {
  @ApiProperty({ example: "msg_001" })
  msg_id: string

  @ApiPropertyOptional({ example: "Xin chào, tôi cần tư vấn" })
  text?: string

  @ApiPropertyOptional({ type: [ZaloOAAttachmentDto] })
  attachments?: ZaloOAAttachmentDto[]
}

export class ZaloOAWebhookDto {
  @ApiProperty({ example: "user_send_text", description: "Loại sự kiện: user_send_text, user_send_image, user_send_file, oa_send_text, ..." })
  event_name: string

  @ApiProperty({ example: "1234567890" })
  app_id: string

  @ApiProperty({ type: ZaloOASenderDto })
  sender: ZaloOASenderDto

  @ApiProperty({ type: ZaloOARecipientDto })
  recipient: ZaloOARecipientDto

  @ApiPropertyOptional({ type: ZaloOAMessageContentDto, description: "Một số event Zalo OA không gửi kèm message payload" })
  message?: ZaloOAMessageContentDto

  @ApiProperty({ example: "1710000000000" })
  timestamp: string

  @ApiProperty({ example: "user_app_id_789" })
  user_id_by_app: string
}
