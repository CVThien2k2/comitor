import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    const request = ctx.getRequest()

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null

    let message = "Lỗi máy chủ nội bộ"
    let errors: string[] | undefined

    if (typeof exceptionResponse === "string") {
      message = exceptionResponse
    } else if (
      exceptionResponse &&
      typeof exceptionResponse === "object" &&
      "message" in exceptionResponse
    ) {
      const msg = (exceptionResponse as { message: string | string[] }).message
      if (Array.isArray(msg)) {
        message = msg[0]
        errors = msg
      } else {
        message = msg
      }
    }

    if (statusCode >= 500) {
      this.logger.error(
        `${httpAdapter.getRequestMethod(request)} ${httpAdapter.getRequestUrl(request)} ${statusCode}`,
        exception instanceof Error ? exception.stack : undefined
      )
    }

    const responseBody = {
      statusCode,
      message,
      ...(errors ? { errors } : {}),
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode)
  }
}
