import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common"
import { Observable, map } from "rxjs"
import type { Response } from "express"

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<Response>()

    return next.handle().pipe(
      map((body: { message?: string; data?: unknown } | unknown) => {
        const statusCode = response.statusCode

        if (body && typeof body === "object" && "message" in body) {
          const { message, data } = body as {
            message: string
            data?: unknown
          }
          return {
            statusCode,
            message,
            ...(data != null ? { data } : {}),
          }
        }

        return {
          statusCode,
          message: "Thành công",
          ...(body != null ? { data: body } : {}),
        }
      })
    )
  }
}
