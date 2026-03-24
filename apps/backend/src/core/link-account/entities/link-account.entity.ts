import { ApiProperty } from "@nestjs/swagger"

export class LinkAccountEntity {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "zalo_oa", enum: ["zalo_personal", "zalo_oa", "facebook", "gmail", "phone"] })
  provider: string

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  linkedByUserId: string

  @ApiProperty({ example: "Comitor Zalo OA", nullable: true })
  displayName: string | null

  @ApiProperty({ example: "zalo_oa_001", nullable: true })
  accountId: string | null

  @ApiProperty({ example: null, nullable: true })
  avatarUrl: string | null

  @ApiProperty({ example: "active", enum: ["active", "inactive"] })
  status: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

// ─── List ────────────────────────────────────────────────

class LinkedByUserSummary {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "Alice Nguyễn" })
  name: string
}

export class LinkAccountListEntity extends LinkAccountEntity {
  @ApiProperty({ type: LinkedByUserSummary })
  linkedByUser: LinkedByUserSummary
}

// ─── Detail ──────────────────────────────────────────────

class LinkedByUserDetail {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "Alice Nguyễn" })
  name: string

  @ApiProperty({ example: null, nullable: true })
  avatarUrl: string | null
}

export class LinkAccountDetailEntity extends LinkAccountEntity {
  @ApiProperty({ type: LinkedByUserDetail })
  linkedByUser: LinkedByUserDetail
}
