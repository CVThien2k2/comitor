import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty } from "class-validator"

export class LinkOAuthDto {
  @ApiProperty({ example: "oauth_code_from_provider", description: "Authorization code từ OAuth callback" })
  @IsString()
  @IsNotEmpty()
  code: string
}
