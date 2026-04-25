import { ApiProperty } from "@nestjs/swagger"

export class LinkAccountEntity {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "zalo_oa", enum: ["zalo_personal", "zalo_oa", "facebook", "gmail", "phone"] })
  provider: string

  @ApiProperty({ example: "Comitor Zalo OA", nullable: true })
  displayName: string | null

  @ApiProperty({ example: "zalo_oa_001", nullable: true })
  accountId: string | null

  @ApiProperty({ example: null, nullable: true })
  avatarUrl: string | null

  @ApiProperty({ example: "active", enum: ["active", "inactive"] })
  status: string

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  createdBy: string

  @ApiProperty({ example: false })
  isDeleted: boolean

  @ApiProperty({
    nullable: true,
    example: { id: "550e8400-e29b-41d4-a716-446655440000", name: "Alice Nguyễn" },
    type: "object",
    properties: {
      id: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000" },
      name: { type: "string", example: "Alice Nguyễn" },
      avatarUrl: { type: "string", example: "https://example.com/avatar.jpg", nullable: true },
    },
  })
  createdByUser: {
    id: string
    name: string
    avatarUrl: string | null
  }

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
