import { Injectable, Logger } from "@nestjs/common"
import type { MessageSender } from "./message-sender.interface"

@Injectable()
export class ZaloOaSender implements MessageSender {
  private readonly logger = new Logger(ZaloOaSender.name)

  constructor() {}

  send() {}
}
