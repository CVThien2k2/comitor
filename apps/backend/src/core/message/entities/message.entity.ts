import { ApiProperty } from "@nestjs/swagger"

export class MessageAttachmentEntity {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  messageId: string

  @ApiProperty({ example: "photo.jpg", nullable: true })
  fileName: string | null

  @ApiProperty({ example: "image", nullable: true })
  fileType: string | null

  @ApiProperty({ example: "https://example.com/photo.jpg", nullable: true })
  fileUrl: string | null

  @ApiProperty({ example: null, nullable: true })
  thumbnailUrl: string | null

  @ApiProperty({ example: "image/jpeg", nullable: true })
  fileMimeType: string | null

  @ApiProperty({ example: "uploads/photo.jpg", nullable: true })
  key: string | null

  @ApiProperty({ nullable: true })
  createdAt: Date | null
}

class MessageSenderUser {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "Alice Nguyễn" })
  name: string

  @ApiProperty({ example: null, nullable: true })
  avatarUrl: string | null
}

class MessageSenderAccountCustomer {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000", nullable: true })
  goldenProfileId: string | null

  @ApiProperty({ example: null, nullable: true })
  avatarUrl: string | null

  @ApiProperty({ example: "Nguyen Van A", nullable: true })
  name: string | null
}

export class MessageBaseEntity {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  conversationId: string

  @ApiProperty({ example: "agent", enum: ["agent", "customer", "system"] })
  senderType: string

  @ApiProperty({ example: null, nullable: true })
  accountCustomerId: string | null

  @ApiProperty({ example: null, nullable: true })
  userId: string | null

  @ApiProperty({ example: "Xin chào!", nullable: true })
  content: string | null

  @ApiProperty({ example: "success", enum: ["processing", "success", "failed"] })
  status: string

  @ApiProperty({ example: null, nullable: true })
  externalId: string | null

  @ApiProperty({ example: false })
  isRead: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class MessageEntity extends MessageBaseEntity {
  @ApiProperty({ type: [MessageAttachmentEntity] })
  attachments: MessageAttachmentEntity[]

  @ApiProperty({ type: MessageSenderUser, nullable: true, description: "Thông tin agent gửi (khi senderType = agent)" })
  user: MessageSenderUser | null

  @ApiProperty({
    type: MessageSenderAccountCustomer,
    nullable: true,
    description: "Thông tin khách gửi (khi senderType = customer)",
  })
  accountCustomer: MessageSenderAccountCustomer | null
}
