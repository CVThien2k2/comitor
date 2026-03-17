import { ApiProperty } from "@nestjs/swagger"

export class PermissionEntity {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "user:read" })
  code: string

  @ApiProperty({ example: "Xem thông tin người dùng", nullable: true })
  description: string | null

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class RoleEntity {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "admin" })
  name: string

  @ApiProperty({ example: "Vai trò quản trị viên", nullable: true })
  description: string | null

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class RoleWithPermissionsEntity extends RoleEntity {
  @ApiProperty({ type: [PermissionEntity] })
  permissions: PermissionEntity[]
}
