import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsOptional, IsString, Min } from "class-validator"

export class UpdateAgentLevelDto {
  @ApiProperty({ example: "senior", required: false })
  @IsString()
  @IsOptional()
  code?: string

  @ApiProperty({ example: "Nhân sự có kinh nghiệm cao", required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: 5, minimum: 0, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  yearsOfExperience?: number

  @ApiProperty({ example: 20, minimum: 1, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  maxConcurrentConversations?: number
}
