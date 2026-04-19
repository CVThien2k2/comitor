import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common"
import { Observable, tap } from "rxjs"
import type { Request, Response } from "express"

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP")

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>()
    const { method, originalUrl, ip } = req
    const now = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>()
          const duration = Date.now() - now
          this.logger.log(`${method} ${originalUrl} ${res.statusCode} - ${duration}ms [${ip}]`)
        },
        error: (error: Error) => {
          const duration = Date.now() - now
          this.logger.error(`${method} ${originalUrl} - ${duration}ms [${ip}] ${error.message}`)
        },
      })
    )
  }
}
