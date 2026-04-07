import { ApiProperty } from "@nestjs/swagger"

export class SuggestedMessageEntity {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" }) 
  id: string

  @ApiProperty({ example: "welcome" }) 
  tag: string

  @ApiProperty({ example: "Chào khách mới" }) 
  message: string

  @ApiProperty({ type: [String], example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"] }) 
  images: string[] | null
}