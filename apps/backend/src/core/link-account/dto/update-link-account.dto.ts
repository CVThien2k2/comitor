import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsOptional } from "class-validator"

export class UpdateLinkAccountDto {
  @ApiProperty({ example: "Comitor Zalo OA", required: false })
  @IsString()
  @IsOptional()
  displayName?: string

  @ApiProperty({ example: "https://example.com/avatar.jpg", required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string

  @ApiProperty({ example: "active", enum: ["active", "inactive"], required: false })
  @IsString()
  @IsOptional()
  status?: "active" | "inactive"
}
