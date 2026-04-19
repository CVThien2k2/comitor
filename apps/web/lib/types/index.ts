export interface ApiResponse<T = unknown> {
  statusCode: number
  message: string
  data?: T
  errors?: string[]
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export * from "./auth"
export * from "./upload"
export * from "./conversation"
export * from "./golden-profile"
export * from "./suggested-message"
export * from "./link-account"
