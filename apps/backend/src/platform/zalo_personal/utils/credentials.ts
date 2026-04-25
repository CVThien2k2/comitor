// export type ZaloPersonalCredentials = {
//   cookie: unknown
//   imei: string
//   userAgent: string
//   language?: string
// }

// export const parseZaloPersonalCredentials = (payload: unknown): ZaloPersonalCredentials | null => {
//   let parsed = payload

//   if (typeof parsed === "string") {
//     try {
//       parsed = JSON.parse(parsed)
//     } catch {
//       return null
//     }
//   }

//   if (!parsed || typeof parsed !== "object") {
//     return null
//   }

//   const { cookie, imei, userAgent, language } = parsed as Record<string, unknown>

//   if (!cookie || typeof imei !== "string" || typeof userAgent !== "string") {
//     return null
//   }

//   return {
//     cookie,
//     imei,
//     userAgent,
//     language: typeof language === "string" ? language : undefined,
//   }
// }

// export const buildZaloPersonalCredentialsPayload = (api: any): string =>
//   JSON.stringify({
//     cookie: api.getCookie(),
//     imei: api.listener.ctx.imei,
//     userAgent: api.listener.ctx.userAgent,
//   })
