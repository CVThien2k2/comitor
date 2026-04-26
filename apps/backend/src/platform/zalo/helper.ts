import { ChannelType } from "@workspace/database"

export const mapAccountInfo = async (api: any) => {
  const raw = (await api.fetchAccountInfo?.()) ?? {}
  const profile = raw.profile ?? {}
  const cookie = api.getCookie?.() ?? null
  if (!profile.userId || !cookie) throw new Error("Có lỗi xảy ra khi lấy thông tin tài khoản Zalo")

  return {
    provider: "zalo_personal" as ChannelType,
    accountId: profile.userId as string,
    displayName: (profile.displayName ?? profile.zaloName ?? profile.username ?? "Unknown") as string,
    avatarUrl: (profile.avatar ?? null) as string,
    credentials: {
      cookie,
      imei: api.listener?.ctx?.imei ?? null,
      userAgent: api.listener?.ctx?.userAgent ?? null,
      profile,
    },
  }
}
