export interface ZaloOaTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface ZaloOaApiResponse<T> {
  data: T
  error: number
  message: string
}

/**
 * Các API xác thực Zalo OA
 */
//Lấy access token từ Zalo OA
export async function getAccessToken(params: {
  appId: string
  secretKey: string
  code: string
}): Promise<ZaloOaTokenResponse | null> {
  const body = new URLSearchParams({
    app_id: params.appId,
    grant_type: "authorization_code",
    code: params.code,
  })
  const response = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
    method: "POST",
    headers: {
      secret_key: params.secretKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })
    .then((res) => res.json() as Promise<ZaloOaTokenResponse>)
    .catch(() => null)

  if (!response?.access_token) return null
  return response
}

//Làm mới access token từ Zalo OA
export async function refreshAccessToken(params: {
  appId: string
  secretKey: string
  refreshToken: string
}): Promise<ZaloOaTokenResponse | null> {
  const body = new URLSearchParams({
    app_id: params.appId,
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
  })

  const response = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
    method: "POST",
    headers: {
      secret_key: params.secretKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })
    .then((res) => res.json() as Promise<ZaloOaTokenResponse>)
    .catch(() => null)

  if (!response?.access_token) return null
  return response
}

/**
 * Các API nghiệp vụ Zalo OA
 */

async function fetchApi<T>(params: {
  path: string
  accessToken: string
  method?: "GET" | "POST"
  body?: any
}): Promise<T | null> {
  const response = await fetch(`https://openapi.zalo.me${params.path}`, {
    method: params.method ?? "GET",
    headers: {
      access_token: params.accessToken,
    },
    body: params.body ? params.body : undefined,
  })
    .then((res) => res.json() as Promise<ZaloOaApiResponse<T>>)
    .catch(() => null)

  if (!response || response.error) return null
  return response.data
}

//Lấy hồ sơ Zalo Official Account
export async function getProfile(accessToken: string) {
  return await fetchApi<any>({
    path: "/v2.0/oa/getoa",
    accessToken: accessToken,
  })
}
