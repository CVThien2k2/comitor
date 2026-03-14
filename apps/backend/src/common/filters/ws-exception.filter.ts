import { Catch, ArgumentsHost, Logger } from "@nestjs/common"
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets"

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient()

    const error =
      exception instanceof WsException
        ? exception.getError()
        : { message: "Internal server error" }

    this.logger.error(`WebSocket error: ${JSON.stringify(error)}`)

    client.emit("error", {
      status: "error",
      ...(typeof error === "string" ? { message: error } : error),
    })
  }
}
