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
