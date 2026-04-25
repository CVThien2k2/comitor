import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private resolveMessage(exceptionResponse: unknown): { message: string; errors?: string[] } {
    if (typeof exceptionResponse === "string") {
      return { message: exceptionResponse }
    }

    if (exceptionResponse && typeof exceptionResponse === "object" && "message" in exceptionResponse) {
      const msg = (exceptionResponse as { message: string | string[] }).message
      if (Array.isArray(msg)) {
        return { message: msg[0], errors: msg }
      }
      return { message: msg }
    }

    return { message: "Lỗi máy chủ nội bộ" }
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null
    const { message, errors } = this.resolveMessage(exceptionResponse)

    const responseBody = {
      statusCode,
      message,
      ...(errors ? { errors } : {}),
    }
    if (response.headersSent || host.getType() !== "http") return //Không gửi response nếu headers đã được gửi hoặc k có http

    httpAdapter.reply(response, responseBody, statusCode)
  }
}
