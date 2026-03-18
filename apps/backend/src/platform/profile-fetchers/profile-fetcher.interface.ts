import type { GoldenProfile } from "@workspace/database"

export interface ProfileFetcher {
  getProfile(userId: string): Promise<Partial<GoldenProfile>>
}
