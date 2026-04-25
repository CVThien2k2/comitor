import type { PaginationQueryDto } from "../common/dto/pagination-query.dto"

export function paginate(query: PaginationQueryDto) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const search = query.search ?? ""
  return { skip: (page - 1) * limit, take: limit, page, limit, search }
}

export function paginatedResponse<T>(items: T[], total: number, page: number, limit: number) {
  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}
