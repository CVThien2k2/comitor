import { ApiProperty } from "@nestjs/swagger"
import { LinkAccountEntity } from "../../link-account/entities/link-account.entity"
import { MessageEntity } from "../../message/entities/message.entity"

class ConversationViewerEntity {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "Nguyễn Văn A" })
  name: string

  @ApiProperty({ example: null, nullable: true })
  avatarUrl: string | null
}

class ConversationBase {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  linkedAccountId: string

  @ApiProperty({ example: "Nguyễn Văn A", nullable: true })
  name: string | null

  @ApiProperty({ example: null, nullable: true })
  externalId: string | null

  @ApiProperty({ example: "personal", enum: ["personal", "group"] })
  type: string

  @ApiProperty({ example: "other", enum: ["other", "business"] })
  tag: string

  @ApiProperty({ example: null, nullable: true, enum: ["searching", "holding", "ticketed", "cancelled"] })
  journeyState: string | null

  @ApiProperty({ example: null, nullable: true })
  lastActivityAt: Date | null

  @ApiProperty({ example: null, nullable: true })
  lastViewedById: string | null

  @ApiProperty({ example: null, nullable: true })
  lastViewedAt: Date | null

  @ApiProperty({ example: null, nullable: true })
  accountCustomerId: string | null

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class ConversationEntity extends ConversationBase {
  @ApiProperty({ type: () => LinkAccountEntity, description: "Chỉ có trường provider" })
  linkedAccount: LinkAccountEntity

  @ApiProperty({ type: () => ConversationViewerEntity, nullable: true })
  lastViewedBy: ConversationViewerEntity | null

  @ApiProperty({ type: MessageEntity, isArray: true })
  messages: MessageEntity[]

  @ApiProperty({ example: 3 })
  unreadCount: number
}
