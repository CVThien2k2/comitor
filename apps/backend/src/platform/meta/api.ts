export interface MetaAccessTokenResponse {
  access_token: string
  token_type: string
}

export interface MetaPageAccount {
  id: string
  name: string
  access_token: string
}

export interface MetaPagesResponse {
  data: MetaPageAccount[]
}

export interface MetaPageInfoResponse {
  id?: string
  name?: string
  picture?: {
    data?: {
      url?: string
    }
  }
}

export async function getUserAccessToken(params: {
  appId: string
  appSecret: string
  redirectUri: string
  code: string
}): Promise<MetaAccessTokenResponse | null> {
  const url = new URL("https://graph.facebook.com/v25.0/oauth/access_token")
  url.searchParams.set("client_id", params.appId)
  url.searchParams.set("client_secret", params.appSecret)
  url.searchParams.set("redirect_uri", params.redirectUri)
  url.searchParams.set("code", params.code)

  const token = await fetch(url.toString(), {
    method: "GET",
  })
    .then((res) => res.json() as Promise<MetaAccessTokenResponse>)
    .catch(() => null)

  if (!token?.access_token) return null
  return token
}

export async function getLongLivedUserToken(params: {
  appId: string
  appSecret: string
  shortLivedToken: string
}): Promise<MetaAccessTokenResponse | null> {
  const url = new URL("https://graph.facebook.com/v25.0/oauth/access_token")
  url.searchParams.set("grant_type", "fb_exchange_token")
  url.searchParams.set("client_id", params.appId)
  url.searchParams.set("client_secret", params.appSecret)
  url.searchParams.set("fb_exchange_token", params.shortLivedToken)

  const token = await fetch(url.toString())
    .then((res) => res.json() as Promise<MetaAccessTokenResponse>)
    .catch(() => null)
  if (!token?.access_token) return null

  return token
}

export async function getPageAccounts(userAccessToken: string): Promise<MetaPageAccount[] | null> {
  const url = new URL("https://graph.facebook.com/v25.0/me/accounts")
  url.searchParams.set("fields", "id,name,access_token")
  url.searchParams.set("access_token", userAccessToken)

  const pages = await fetch(url.toString())
    .then((res) => res.json() as Promise<MetaPagesResponse>)
    .catch(() => null)
  if (!pages?.data) return null

  return pages.data
}

export async function getPageInfo(pageId: string, pageAccessToken: string): Promise<MetaPageInfoResponse | null> {
  const url = new URL(`https://graph.facebook.com/v25.0/${pageId}`)
  url.searchParams.set("fields", "id,name,picture.type(large)")
  url.searchParams.set("access_token", pageAccessToken)

  const pageInfo = await fetch(url.toString())
    .then((res) => res.json() as Promise<MetaPageInfoResponse>)
    .catch(() => null)

  if (!pageInfo) return null
  return pageInfo
}
