import { ApiProperty } from "@nestjs/swagger"
import { UserEntity } from "../../core/users/entities/user.entity"

export class AuthEntity {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIs..." })
  accessToken: string

  @ApiProperty({ example: 1710401100000 })
  accessExpiresAt: number

  @ApiProperty({ example: ["user:read", "role:update"], type: [String] })
  permissions: string[]

  @ApiProperty({ type: UserEntity })
  user: UserEntity
}

export class RefreshEntity {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIs..." })
  accessToken: string

  @ApiProperty({ example: 1710401100000 })
  accessExpiresAt: number

  @ApiProperty({ example: ["user:read", "role:update"], type: [String] })
  permissions: string[]

  @ApiProperty({ type: UserEntity })
  user: UserEntity
}
