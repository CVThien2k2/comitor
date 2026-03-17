import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsEmail, IsOptional, IsUUID, IsBoolean } from "class-validator"

export class UpdateUserDto {
  @ApiProperty({ example: "Nguyễn Văn A", required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ example: "user@example.com", required: false })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ example: "0901234567", required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ example: "https://example.com/avatar.jpg", required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000", required: false })
  @IsUUID()
  @IsOptional()
  roleId?: string

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
