import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsOptional, IsBoolean } from "class-validator"

export class UpdateAccountCustomerDto {
  @ApiProperty({ example: "https://example.com/avatar.jpg", required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
