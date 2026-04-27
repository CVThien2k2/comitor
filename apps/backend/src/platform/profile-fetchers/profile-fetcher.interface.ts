import type { LinkAccount } from "@workspace/database"

export interface ProfileFetcher {
  getProfile(userId: string, linkedAccount: LinkAccount)
}
