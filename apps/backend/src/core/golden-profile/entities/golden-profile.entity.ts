import { ApiProperty } from "@nestjs/swagger"

export class GoldenProfileEntity {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "Nguyễn Văn An", nullable: true })
  fullName: string | null

  @ApiProperty({ example: "male", nullable: true, enum: ["male", "female", "other"] })
  gender: string | null

  @ApiProperty({ example: "1990-05-15", nullable: true })
  dateOfBirth: Date | null

  @ApiProperty({ example: "0901234567", nullable: true })
  primaryPhone: string | null

  @ApiProperty({ example: "an.nguyen@gmail.com", nullable: true })
  primaryEmail: string | null

  @ApiProperty({ example: "123 Nguyễn Huệ, Q.1", nullable: true })
  address: string | null

  @ApiProperty({ example: "Hồ Chí Minh", nullable: true })
  city: string | null

  @ApiProperty({ example: "gold", nullable: true, enum: ["bronze", "silver", "gold", "platinum"] })
  memberTier: string | null

  @ApiProperty({ example: 0 })
  loyaltyPoints: number

  @ApiProperty({ example: "individual", enum: ["individual", "business", "agent"] })
  customerType: string

  @ApiProperty({ example: null, nullable: true })
  elinesCustomerId: string | null

  @ApiProperty({ example: false })
  isBlacklisted: boolean

  @ApiProperty({ example: null, nullable: true, enum: ["searching", "holding", "ticketed", "cancelled"] })
  journeyState: string | null

  @ApiProperty({ example: null, nullable: true })
  characteristics: string | null

  @ApiProperty({ example: null, nullable: true })
  staffNotes: string | null

  @ApiProperty({ nullable: true })
  createdAt: Date | null

  @ApiProperty({ nullable: true })
  updatedAt: Date | null
}

// ─── Detail ──────────────────────────────────────────────

class AccountCustomerLinkedAccount {
  @ApiProperty({ example: "zalo_oa", enum: ["zalo_personal", "zalo_oa", "facebook", "gmail", "phone"] })
  provider: string

  @ApiProperty({ example: "Comitor Zalo OA", nullable: true })
  displayName: string | null
}

class AccountCustomerInProfile {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "cust_zalo_001" })
  accountId: string

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  linkedAccountId: string

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  goldenProfileId: string

  @ApiProperty({ example: null, nullable: true })
  avatarUrl: string | null

  @ApiProperty({ example: false })
  isOnline: boolean

  @ApiProperty({ example: true })
  isActive: boolean

  @ApiProperty({ nullable: true })
  createdAt: Date | null

  @ApiProperty()
  updatedAt: Date

  @ApiProperty({ type: AccountCustomerLinkedAccount })
  linkedAccount: AccountCustomerLinkedAccount
}

export class GoldenProfileDetailEntity extends GoldenProfileEntity {
  @ApiProperty({ type: [AccountCustomerInProfile] })
  accountCustomers: AccountCustomerInProfile[]
}
