export type ZaloPersonalLoginStatus = "pending" | "qr_ready" | "scanned" | "authenticated" | "failed"

export type ZaloPersonalAccountLinked = {
  id: string
  provider: "zalo_personal"
  displayName: string | null
  accountId: string | null
  avatarUrl: string | null
}

export type ZaloPersonalLoginSession = {
  id: string
  userId: string
  qrImage?: string
  ownId?: string
  displayName?: string
  zaloName?: string
  error?: string
  status: ZaloPersonalLoginStatus
  linkedAccount?: ZaloPersonalAccountLinked | null
}

export type PublicZaloPersonalLoginSession = Omit<ZaloPersonalLoginSession, "userId">

export type ActiveZaloPersonalSession = {
  id: string
  status: "authenticated" | "failed"
  api: any
  accountId: string | null
  displayName: string | null
  zaloName?: string | null
}

export type ZaloPersonalUserProfile = {
  userId?: string
  username?: string
  displayName?: string
  zaloName?: string
  avatar?: string
  gender?: number | null
  dob?: number | null
  sdob?: string
  phoneNumber?: string
  [key: string]: unknown
}
