import { ApiProperty } from "@nestjs/swagger"

export class UserEntity {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "Nguyễn Văn A" })
  name: string

  @ApiProperty({ example: "user@example.com" })
  email: string

  @ApiProperty({ example: "nguyenvana" })
  username: string

  @ApiProperty({ example: false })
  emailVerified: boolean

  @ApiProperty({ example: null, nullable: true })
  avatarUrl: string | null

  @ApiProperty({ example: null, nullable: true })
  phone: string | null

  @ApiProperty({ example: null, nullable: true })
  roleId: string | null

  @ApiProperty({ example: true })
  isActive: boolean

  @ApiProperty({ example: false })
  isOnline: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

// ─── List ────────────────────────────────────────────────

class RoleSummary {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "admin" })
  name: string
}

export class UserListEntity extends UserEntity {
  @ApiProperty({ type: RoleSummary, nullable: true })
  role: RoleSummary | null
}

// ─── Detail ──────────────────────────────────────────────

class RoleDetail {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "admin" })
  name: string

  @ApiProperty({ example: "Quản trị viên", nullable: true })
  description: string | null
}

export class UserDetailEntity extends UserEntity {
  @ApiProperty({ type: RoleDetail, nullable: true })
  role: RoleDetail | null
}
