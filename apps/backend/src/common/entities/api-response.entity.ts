import { ApiProperty } from "@nestjs/swagger"
import { Type } from "@nestjs/common"

export class ApiResponseEntity<T = unknown> {
  @ApiProperty({ example: 200 })
  statusCode: number

  @ApiProperty({ example: "Success" })
  message: string

  @ApiProperty({ type: Object, nullable: true, required: false })
  data?: T
}

// ─── Message-only Response (no data) ─────────────────────

export class MessageResponseEntity {
  @ApiProperty({ example: 200 })
  statusCode: number

  @ApiProperty({ example: "Success message" })
  message: string
}

// ─── Error Responses ─────────────────────────────────────

export class BadRequestEntity {
  @ApiProperty({ example: 400 })
  statusCode: number

  @ApiProperty({ example: "Validation failed" })
  message: string

  @ApiProperty({ example: ["message error example"], type: [String] })
  errors: string[]
}

export class UnauthorizedEntity {
  @ApiProperty({ example: 401 })
  statusCode: number

  @ApiProperty({ example: "Unauthorized" })
  message: string
}

export class ForbiddenEntity {
  @ApiProperty({ example: 403 })
  statusCode: number

  @ApiProperty({ example: "Forbidden" })
  message: string
}

export class NotFoundEntity {
  @ApiProperty({ example: 404 })
  statusCode: number

  @ApiProperty({ example: "Resource not found" })
  message: string
}

export class ConflictEntity {
  @ApiProperty({ example: 409 })
  statusCode: number

  @ApiProperty({ example: "Resource already exists" })
  message: string
}

export class InternalServerErrorEntity {
  @ApiProperty({ example: 500 })
  statusCode: number

  @ApiProperty({ example: "Internal server error" })
  message: string
}

// ─── Helper ──────────────────────────────────────────────

export function ApiResponseOf(dataType: Type) {
  class WrappedResponseEntity extends ApiResponseEntity {
    @ApiProperty({ type: dataType })
    declare data: InstanceType<typeof dataType>
  }

  Object.defineProperty(WrappedResponseEntity, "name", {
    value: `ApiResponseOf${dataType.name}`,
  })

  return WrappedResponseEntity
}

export function ApiResponseOfArray(dataType: Type) {
  class WrappedResponseEntity extends ApiResponseEntity {
    @ApiProperty({ type: [dataType] })
    declare data: InstanceType<typeof dataType>[]
  }

  Object.defineProperty(WrappedResponseEntity, "name", {
    value: `ApiResponseOfArray${dataType.name}`,
  })

  return WrappedResponseEntity
}
