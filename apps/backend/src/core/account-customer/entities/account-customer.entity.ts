import { ApiProperty } from "@nestjs/swagger"
import { GoldenProfileEntity } from "../../golden-profile/entities/golden-profile.entity"

export class AccountCustomerEntity {
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
}

// ─── List ────────────────────────────────────────────────

class GoldenProfileSummary {
  @ApiProperty({ example: "Nguyễn Văn An", nullable: true })
  fullName: string | null

  @ApiProperty({ example: "0901234567", nullable: true })
  primaryPhone: string | null

  @ApiProperty({ example: "an@gmail.com", nullable: true })
  primaryEmail: string | null
}

class LinkedAccountSummary {
  @ApiProperty({ example: "zalo_oa", enum: ["zalo_personal", "zalo_oa", "facebook", "gmail", "phone"] })
  provider: string

  @ApiProperty({ example: "Comitor Zalo OA", nullable: true })
  displayName: string | null
}

export class AccountCustomerListEntity extends AccountCustomerEntity {
  @ApiProperty({ type: GoldenProfileSummary })
  goldenProfile: GoldenProfileSummary

  @ApiProperty({ type: LinkedAccountSummary })
  linkedAccount: LinkedAccountSummary
}

// ─── Detail ──────────────────────────────────────────────

class LinkedAccountDetail {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "zalo_oa", enum: ["zalo_personal", "zalo_oa", "facebook", "gmail", "phone"] })
  provider: string

  @ApiProperty({ example: "Comitor Zalo OA", nullable: true })
  displayName: string | null

  @ApiProperty({ example: null, nullable: true })
  avatarUrl: string | null
}

export class AccountCustomerDetailEntity extends AccountCustomerEntity {
  @ApiProperty({ type: () => GoldenProfileEntity })
  goldenProfile: GoldenProfileEntity

  @ApiProperty({ type: LinkedAccountDetail })
  linkedAccount: LinkedAccountDetail
}
