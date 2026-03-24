import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsEmail, IsOptional, IsUUID, MinLength } from "class-validator"

export class CreateUserDto {
  @ApiProperty({ example: "Nguyễn Văn A" })
  @IsString()
  name: string

  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string

  @ApiProperty({ example: "nguyenvana" })
  @IsString()
  username: string

  @ApiProperty({ example: "123456", minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty({ example: "0901234567", required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  roleId: string
}
