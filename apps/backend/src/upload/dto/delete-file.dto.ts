import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator"

export class DeleteFileDto {
  @ApiProperty({
    example: "uploads/avatars/profile-1710401100000-abc.jpg",
    description: "Khóa đối tượng S3 cần xóa",
  })
  @IsNotEmpty()
  @IsString()
  key: string
}

export class DeleteFileBatchDto {
  @ApiProperty({ type: [DeleteFileDto], description: "Danh sách tệp cần xóa" })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeleteFileDto)
  keys: DeleteFileDto[]
}
