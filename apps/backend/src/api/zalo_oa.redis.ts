export const ZALO_OA_ACCESS_TOKEN_TTL_SECONDS = 24 * 60 * 60 // Mã truy cập Zalo OA có thời gian tồn tại (TTL) là 24 giờ, nhưng đặt là 23 giờ để đảm bảo làm mới mã trước khi nó hết hạn.
export const ZALO_OA_REFRESH_TOKEN_TTL_SECONDS = 89 * 24 * 60 * 60 // Mã làm mới Zalo OA có thời gian tồn tại (TTL) là 89 ngày, nhưng đặt là 89 ngày để đảm bảo làm mới mã trước khi nó hết hạn.

export const getZaloOaAccessTokenRedisKey = (accountId: string) => `auth:zalo_oa:${accountId}:access_token`

export const getZaloOaRefreshTokenRedisKey = (accountId: string) => `auth:zalo_oa:${accountId}:refresh_token`
