import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator"

class FileItemDto {
  @ApiProperty({ example: "photo1.jpg", description: "Original filename" })
  @IsNotEmpty()
  @IsString()
  filename: string

  @ApiProperty({ example: "image/jpeg", description: "MIME type of the file" })
  @IsNotEmpty()
  @IsString()
  contentType: string
}

export class CreatePresignedBatchDto {
  @ApiProperty({ example: "uploads/photos", description: "S3 folder path" })
  @IsNotEmpty()
  @IsString()
  folder: string

  @ApiProperty({ type: [FileItemDto], description: "List of files to upload" })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileItemDto)
  files: FileItemDto[]
}
