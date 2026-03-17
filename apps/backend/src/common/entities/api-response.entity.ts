import { ApiProperty } from "@nestjs/swagger"
import { Type } from "@nestjs/common"

export class ApiResponseEntity<T = unknown> {
  @ApiProperty({ example: 200 })
  statusCode: number

  @ApiProperty({ example: "Thành công" })
  message: string

  @ApiProperty({ type: Object, nullable: true, required: false })
  data?: T
}

// ─── Message-only Response (no data) ─────────────────────

export class MessageResponseEntity {
  @ApiProperty({ example: 200 })
  statusCode: number

  @ApiProperty({ example: "Thao tác thành công" })
  message: string
}

// ─── Error Responses ─────────────────────────────────────

export class BadRequestEntity {
  @ApiProperty({ example: 400 })
  statusCode: number

  @ApiProperty({ example: "Dữ liệu không hợp lệ" })
  message: string

  @ApiProperty({ example: ["Lỗi ví dụ"], type: [String] })
  errors: string[]
}

export class UnauthorizedEntity {
  @ApiProperty({ example: 401 })
  statusCode: number

  @ApiProperty({ example: "Chưa xác thực" })
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

  @ApiProperty({ example: "Tài nguyên đã tồn tại" })
  message: string
}

export class InternalServerErrorEntity {
  @ApiProperty({ example: 500 })
  statusCode: number

  @ApiProperty({ example: "Lỗi máy chủ nội bộ" })
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
