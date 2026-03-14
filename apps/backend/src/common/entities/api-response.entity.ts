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

// ─── Error Responses ─────────────────────────────────────

export class BadRequestEntity {
  @ApiProperty({ example: 400 })
  statusCode: number

  @ApiProperty({ example: "Dữ liệu không hợp lệ" })
  message: string

  @ApiProperty({ example: ["username should not be empty"], type: [String] })
  errors: string[]
}

export class UnauthorizedEntity {
  @ApiProperty({ example: 401 })
  statusCode: number

  @ApiProperty({ example: "Lỗi xác thực" })
  message: string
}

export class ForbiddenEntity {
  @ApiProperty({ example: 403 })
  statusCode: number

  @ApiProperty({ example: "Không có quyền truy cập" })
  message: string
}

export class NotFoundEntity {
  @ApiProperty({ example: 404 })
  statusCode: number

  @ApiProperty({ example: "Không tìm thấy tài nguyên" })
  message: string
}

export class ConflictEntity {
  @ApiProperty({ example: 409 })
  statusCode: number

  @ApiProperty({ example: "Dữ liệu đã tồn tại" })
  message: string
}

export class InternalServerErrorEntity {
  @ApiProperty({ example: 500 })
  statusCode: number

  @ApiProperty({ example: "Lỗi hệ thống" })
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
