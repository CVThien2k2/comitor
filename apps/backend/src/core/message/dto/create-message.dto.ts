import { ApiProperty } from "@nestjs/swagger"
import { IsObject, IsUUID } from "class-validator"
import type { ContentMessage } from "../../../utils/types/message"

export class CreateMessageDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  conversationId: string

  @ApiProperty({ example: { type: "text", text: "Xin chào!" } })
  @IsObject()
  content: ContentMessage
}
