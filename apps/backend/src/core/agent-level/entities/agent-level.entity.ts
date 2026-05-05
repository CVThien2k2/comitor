import { ApiProperty } from "@nestjs/swagger"

export class AgentLevelEntity {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "senior" })
  code: string

  @ApiProperty({ example: "Nhân sự có kinh nghiệm cao" })
  description: string

  @ApiProperty({ example: 5 })
  yearsOfExperience: number

  @ApiProperty({ example: 20 })
  maxConcurrentConversations: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
