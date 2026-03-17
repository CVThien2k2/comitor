import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator"

class FileItemDto {
  @ApiProperty({ example: "photo1.jpg", description: "Tên tệp gốc" })
  @IsNotEmpty()
  @IsString()
  filename: string

  @ApiProperty({ example: "image/jpeg", description: "Loại MIME của tệp" })
  @IsNotEmpty()
  @IsString()
  contentType: string
}

export class CreatePresignedBatchDto {
  @ApiProperty({ example: "uploads/photos", description: "Đường dẫn thư mục S3" })
  @IsNotEmpty()
  @IsString()
  folder: string

  @ApiProperty({ type: [FileItemDto], description: "Danh sách tệp cần upload" })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileItemDto)
  files: FileItemDto[]
}
