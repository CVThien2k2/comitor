import { ApiProperty } from "@nestjs/swagger"

export class LinkAccountStatsEntity {
  @ApiProperty({ example: 42 })
  totalCount: number

  @ApiProperty({ example: 35 })
  activeCount: number

  @ApiProperty({ example: 3 })
  providerCount: number
}
