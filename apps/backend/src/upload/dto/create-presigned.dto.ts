import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class CreatePresignedDto {
  @ApiProperty({ example: "uploads/avatars", description: "S3 folder path" })
  @IsNotEmpty()
  @IsString()
  folder: string

  @ApiProperty({ example: "profile.jpg", description: "Original filename" })
  @IsNotEmpty()
  @IsString()
  filename: string

  @ApiProperty({ example: "image/jpeg", description: "MIME type of the file" })
  @IsNotEmpty()
  @IsString()
  contentType: string
}
