const META_OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_META_APP_ID ?? ""
const META_OAUTH_SCOPE =
  "pages_show_list,pages_messaging,pages_manage_metadata,business_management,pages_read_engagement"

export function getMetaRedirectUri(): string {
  const env = process.env.NEXT_PUBLIC_ENV
  if (env === "production") {
    return process.env.NEXT_PUBLIC_META_REDIRECT_URI_PRODUCTION ?? ""
  }

  return process.env.NEXT_PUBLIC_META_REDIRECT_URI_DEV ?? ""
}

export function buildMetaOAuthUrl(): string {
  const redirectUri = getMetaRedirectUri()

  if (!redirectUri || !META_OAUTH_CLIENT_ID) {
    return ""
  }

  const params = new URLSearchParams({
    client_id: META_OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: META_OAUTH_SCOPE,
    response_type: "code",
  })

  return `https://www.facebook.com/v24.0/dialog/oauth?${params.toString()}`
}

export function isMetaOAuthAvailable(): boolean {
  return buildMetaOAuthUrl().length > 0
}
