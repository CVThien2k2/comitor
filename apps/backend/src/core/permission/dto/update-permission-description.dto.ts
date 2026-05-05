import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class UpdatePermissionDescriptionDto {
  @ApiProperty({ example: "Xem thông tin người dùng trong hệ thống" })
  @IsString()
  @IsNotEmpty()
  description: string
}

