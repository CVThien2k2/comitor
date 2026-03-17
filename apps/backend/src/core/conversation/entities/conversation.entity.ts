import { ApiProperty } from "@nestjs/swagger"
import { AccountCustomerEntity } from "../../account-customer/entities/account-customer.entity"
import { LinkAccountEntity } from "../../link-account/entities/link-account.entity"

// ─── Base ────────────────────────────────────────────────

class ConversationBase {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  linkedAccountId: string

  @ApiProperty({ example: "Nguyễn Văn A", nullable: true })
  name: string | null

  @ApiProperty({ example: null, nullable: true })
  idGroup: string | null

  @ApiProperty({ example: "personal", enum: ["personal", "group"] })
  type: string

  @ApiProperty({ example: "other", enum: ["other", "business"] })
  tag: string

  @ApiProperty({ example: null, nullable: true, enum: ["searching", "holding", "ticketed", "cancelled"] })
  journeyState: string | null

  @ApiProperty({ example: null, nullable: true })
  lastActivityAt: Date | null

  @ApiProperty({ example: null, nullable: true })
  accountCustomerId: string | null

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

class LastMessageSenderUser {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "Alice Nguyễn" })
  name: string

  @ApiProperty({ example: null, nullable: true })
  avatarUrl: string | null
}

class LastMessageSenderGoldenProfile {
  @ApiProperty({ example: "Nguyễn Văn An", nullable: true })
  fullName: string | null
}

class LastMessageSenderAccountCustomer {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: null, nullable: true })
  avatarUrl: string | null

  @ApiProperty({ type: LastMessageSenderGoldenProfile })
  goldenProfile: LastMessageSenderGoldenProfile
}

class LastMessage {
  @ApiProperty({ example: "Xin chào!", nullable: true })
  content: string | null

  @ApiProperty({ example: "customer", enum: ["agent", "customer", "system"] })
  senderType: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty({ type: LastMessageSenderUser, nullable: true })
  user: LastMessageSenderUser | null

  @ApiProperty({ type: LastMessageSenderAccountCustomer, nullable: true })
  accountCustomer: LastMessageSenderAccountCustomer | null
}

export class ConversationListEntity extends ConversationBase {
  @ApiProperty({ type: () => LinkAccountEntity, description: "Chỉ có trường provider" })
  linkedAccount: Pick<LinkAccountEntity, "provider">

  @ApiProperty({ type: LastMessage, nullable: true })
  lastMessage: LastMessage | null

  @ApiProperty({ example: 3 })
  unreadCount: number
}

export class ConversationCustomerEntity {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  conversationId: string

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  accountCustomerId: string

  @ApiProperty({ example: false })
  isAdmin: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class ConversationCustomerWithAccount extends ConversationCustomerEntity {
  @ApiProperty({ type: () => AccountCustomerEntity })
  accountCustomer: AccountCustomerEntity
}

export class ConversationDetailEntity extends ConversationBase {
  @ApiProperty({ type: () => LinkAccountEntity })
  linkedAccount: LinkAccountEntity

  @ApiProperty({ type: [ConversationCustomerWithAccount] })
  conversationCustomers: ConversationCustomerWithAccount[]
}
