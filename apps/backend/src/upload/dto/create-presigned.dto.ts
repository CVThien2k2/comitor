import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class CreatePresignedDto {
  @ApiProperty({ example: "uploads/avatars", description: "Đường dẫn thư mục S3" })
  @IsNotEmpty()
  @IsString()
  folder: string

  @ApiProperty({ example: "profile.jpg", description: "Tên tệp gốc" })
  @IsNotEmpty()
  @IsString()
  filename: string

  @ApiProperty({ example: "image/jpeg", description: "Loại MIME của tệp" })
  @IsNotEmpty()
  @IsString()
  contentType: string
}
