import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsString, Min } from "class-validator"

export class CreateAgentLevelDto {
  @ApiProperty({ example: "senior" })
  @IsString()
  code: string

  @ApiProperty({ example: "Nhân sự có kinh nghiệm cao" })
  @IsString()
  description: string

  @ApiProperty({ example: 5, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  yearsOfExperience: number

  @ApiProperty({ example: 20, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxConcurrentConversations: number
}
