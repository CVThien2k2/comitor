import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class ForgotPasswordDto {
  @ApiProperty({ example: "nguyenvana" })
  @IsString()
  username: string
}
