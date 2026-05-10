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

export function cursorPaginatedResponse<T, C = Record<string, any>>(
  items: T[],
  total: number | undefined,
  limit: number,
  getCursorValues?: (lastItem: T) => C,
  options?: { reverse?: boolean }
) {
  const hasMore = items.length > limit
  const normalizedItems = hasMore ? items.slice(0, limit) : items
  const lastItem = normalizedItems[normalizedItems.length - 1]

  let nextCursor: C | null = null
  if (hasMore && lastItem && getCursorValues) {
    nextCursor = getCursorValues(lastItem)
  }

  const finalItems = options?.reverse ? [...normalizedItems].reverse() : normalizedItems

  return {
    items: finalItems,
    meta: {
      limit,
      total,
      hasMore,
      nextCursor,
    },
  }
}
