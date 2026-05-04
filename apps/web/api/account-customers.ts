import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse } from "@/lib/types"
import type { ChannelType } from "@workspace/database"

export type AccountCustomersQuery = {
  page?: number
  limit?: number
  search?: string
}

export type AccountCustomerListItem = {
  id: string
  accountId: string
  linkedAccountId: string
  goldenProfileId: string
  avatarUrl: string | null
  isOnline: boolean
  isActive: boolean
  createdAt: string | null
  updatedAt: string
  goldenProfile: {
    fullName: string | null
    primaryPhone: string | null
    primaryEmail: string | null
  }
  linkedAccount: {
    provider: ChannelType
    displayName: string | null
  }
}

export const accountCustomers = {
  getAll: (query?: AccountCustomersQuery) =>
    api.get<ApiResponse<PaginatedResponse<AccountCustomerListItem>>>("/account-customers", {
      params: query,
    }),
}
