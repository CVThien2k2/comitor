import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsOptional, IsEnum } from "class-validator"

export class UpdateConversationDto {
  @ApiProperty({ example: "Nguyễn Văn A", required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ example: "business", enum: ["other", "business"], required: false })
  @IsEnum(["other", "business"])
  @IsOptional()
  tag?: string

  @ApiProperty({ example: "searching", enum: ["searching", "holding", "ticketed", "cancelled"], required: false })
  @IsEnum(["searching", "holding", "ticketed", "cancelled"])
  @IsOptional()
  journeyState?: string
}
