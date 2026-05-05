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

  @ApiProperty({ example: null, nullable: true })
  agentLevelId: string | null

  @ApiProperty({ example: true })
  isActive: boolean

  @ApiProperty({ example: false })
  isOnline: boolean

  @ApiProperty({ example: 0 })
  countProcessing: number

  @ApiProperty({ example: true })
  isReadyProcessing: boolean

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  createdBy: string

  @ApiProperty({ example: false })
  isDeleted: boolean

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

class AgentLevelSummary {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "senior" })
  code: string

  @ApiProperty({ example: "Nhân sự có kinh nghiệm cao" })
  description: string
}

export class UserListEntity extends UserEntity {
  @ApiProperty({ type: RoleSummary, nullable: true })
  role: RoleSummary | null

  @ApiProperty({ type: AgentLevelSummary, nullable: true })
  agentLevel: AgentLevelSummary | null
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

  @ApiProperty({ type: AgentLevelSummary, nullable: true })
  agentLevel: AgentLevelSummary | null
}
