import type { GoldenProfile, LinkAccount } from "@workspace/database"

export type ProfileResult = {
  profile: Partial<GoldenProfile>
  avatarUrl: string
}

export interface ProfileFetcher {
  getProfile(userId: string, linkedAccount: LinkAccount)
}
