import type { ChannelType, CustomerType, Gender, JourneyState, MemberTier } from "@workspace/database"

export interface GoldenProfileRecord {
  id: string
  fullName: string | null
  gender: Gender | null
  dateOfBirth: string | null
  primaryPhone: string | null
  primaryEmail: string | null
  address: string | null
  city: string | null
  memberTier: MemberTier | null
  loyaltyPoints: number
  customerType: CustomerType
  elinesCustomerId: string | null
  isBlacklisted: boolean
  journeyState: JourneyState | null
  characteristics: string | null
  staffNotes: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface GoldenProfileAccountCustomer {
  id: string
  accountId: string
  linkedAccountId: string
  goldenProfileId: string
  avatarUrl: string | null
  isOnline: boolean
  isActive: boolean
  createdAt: string | null
  updatedAt: string
  linkedAccount: {
    provider: ChannelType
    displayName: string | null
  }
}

export interface GoldenProfileDetail extends GoldenProfileRecord {
  accountCustomers: GoldenProfileAccountCustomer[]
}

export interface UpdateGoldenProfilePayload {
  fullName?: string | null
  gender?: Gender | null
  dateOfBirth?: string | null
  primaryPhone?: string | null
  primaryEmail?: string | null
  address?: string | null
  city?: string | null
  memberTier?: MemberTier | null
  loyaltyPoints?: number
  customerType?: CustomerType
  elinesCustomerId?: string | null
  isBlacklisted?: boolean
  journeyState?: JourneyState | null
  characteristics?: string | null
  staffNotes?: string | null
}
