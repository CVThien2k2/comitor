import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsOptional, IsArray } from "class-validator"

export class CreateSuggestedMessageDto {
  @ApiProperty({ example: "welcome", required: false })
  @IsString()
  @IsNotEmpty()
  tag: string

  @ApiProperty({ example: "Chào khách mới", required: false })
  @IsString()
  @IsNotEmpty()
  message: string

  @ApiProperty({ example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"], required: false })
  @IsArray()
  @IsOptional()
  images?: string[]
}
