import type { User, LinkAccount, ChannelType } from "@workspace/database"

export * from "./conversation"

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

export type UserProfile = Omit<User, "password">

export interface AuthResponse {
  accessToken: string
  accessExpiresAt: number
  user: UserProfile
}

export type PresignedData = {
  key: string
  uploadUrl: string
  url: string
}

// ─── Link Account ─────────────────────────────────────────

export type { ChannelType }

export type LinkAccountItem = LinkAccount & {
  linkedByUser: { id: string; name: string }
}

export type LinkAccountDetail = LinkAccount & {
  linkedByUser: { id: string; name: string; avatarUrl: string | null }
}
