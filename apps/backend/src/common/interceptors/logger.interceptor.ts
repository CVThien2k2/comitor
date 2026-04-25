import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger, HttpException } from "@nestjs/common"
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
        error: (error: HttpException | Error) => {
          const res =
            error instanceof HttpException
              ? (error.getResponse() as { message: string; statusCode: number })
              : { message: error.message, statusCode: 500 }
          const duration = Date.now() - now
          this.logger.error(`[${method}][${res.statusCode}][${originalUrl}] - ${duration}ms [${ip}] ${res.message}`)
        },
      })
    )
  }
}
