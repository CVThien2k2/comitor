import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, IsDateString, Min } from "class-validator"

export class UpdateGoldenProfileDto {
  @ApiProperty({ example: "Nguyễn Văn An", required: false })
  @IsString()
  @IsOptional()
  fullName?: string | null

  @ApiProperty({ example: "male", enum: ["male", "female", "other"], required: false })
  @IsEnum(["male", "female", "other"])
  @IsOptional()
  gender?: string | null

  @ApiProperty({ example: "1990-05-15", required: false })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string | null

  @ApiProperty({ example: "0901234567", required: false })
  @IsString()
  @IsOptional()
  primaryPhone?: string | null

  @ApiProperty({ example: "an@gmail.com", required: false })
  @IsString()
  @IsOptional()
  primaryEmail?: string | null

  @ApiProperty({ example: "123 Nguyễn Huệ, Q.1", required: false })
  @IsString()
  @IsOptional()
  address?: string | null

  @ApiProperty({ example: "Hồ Chí Minh", required: false })
  @IsString()
  @IsOptional()
  city?: string | null

  @ApiProperty({ example: "gold", enum: ["bronze", "silver", "gold", "platinum"], required: false })
  @IsEnum(["bronze", "silver", "gold", "platinum"])
  @IsOptional()
  memberTier?: string | null

  @ApiProperty({ example: 100, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  loyaltyPoints?: number

  @ApiProperty({ example: "individual", enum: ["individual", "business", "agent"], required: false })
  @IsEnum(["individual", "business", "agent"])
  @IsOptional()
  customerType?: string | null

  @ApiProperty({ example: null, required: false })
  @IsString()
  @IsOptional()
  elinesCustomerId?: string | null

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isBlacklisted?: boolean

  @ApiProperty({ example: "searching", enum: ["searching", "holding", "ticketed", "cancelled"], required: false })
  @IsEnum(["searching", "holding", "ticketed", "cancelled"])
  @IsOptional()
  journeyState?: string | null

  @ApiProperty({ example: null, required: false })
  @IsString()
  @IsOptional()
  characteristics?: string | null

  @ApiProperty({ example: null, required: false })
  @IsString()
  @IsOptional()
  staffNotes?: string | null
}
