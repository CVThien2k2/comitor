import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator"

export class DeleteFileDto {
  @ApiProperty({
    example: "uploads/avatars/profile-1710401100000-abc.jpg",
    description: "S3 object key to delete",
  })
  @IsNotEmpty()
  @IsString()
  key: string
}

export class DeleteFileBatchDto {
  @ApiProperty({ type: [DeleteFileDto], description: "List of files to delete" })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeleteFileDto)
  keys: DeleteFileDto[]
}
