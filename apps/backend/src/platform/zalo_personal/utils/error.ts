import { inspect } from "node:util"
import { ZaloPersonalLoginSession } from "../../../utils/types"

export const stringifyUnknownError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return inspect(error, { depth: 4, breakLength: 120 })
}

export const formatZaloPersonalLoginError = (error: unknown, session: ZaloPersonalLoginSession) => {
  const errorLike = error as
    | (Error & {
        code?: unknown
        response?: unknown
        cause?: unknown
      })
    | undefined

  return `Dang nhap Zalo Personal that bai: ${inspect(
    {
      sessionId: session.id,
      userId: session.userId,
      status: session.status,
      ownId: session.ownId ?? null,
      displayName: session.displayName ?? null,
      name: errorLike?.name ?? null,
      message: errorLike?.message ?? null,
      code: errorLike?.code ?? null,
      response: errorLike?.response ?? null,
      cause: errorLike?.cause ?? null,
    },
    { depth: 6, breakLength: 120 }
  )}`
}
