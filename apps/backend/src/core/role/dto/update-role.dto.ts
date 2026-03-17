import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsOptional, IsArray, IsUUID } from "class-validator"

export class UpdateRoleDto {
  @ApiProperty({ example: "editor", required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ example: "Vai trò biên tập viên", required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: ["uuid1", "uuid2"], required: false })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  permissionIds?: string[]
}
