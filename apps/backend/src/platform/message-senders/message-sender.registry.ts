import { Injectable } from "@nestjs/common"
import type { MessageSender } from "./message-sender.interface"
import { ZaloOaSender } from "./zalo-oa.sender"
import { FacebookSender } from "./facebook.sender"
import { ZaloPersonalSender } from "./zalo-personal.sender"

@Injectable()
export class MessageSenderRegistry {
  private readonly senders: Map<string, MessageSender>

  constructor(
    private readonly zaloOa: ZaloOaSender,
    private readonly facebook: FacebookSender,
    private readonly zaloPersonal: ZaloPersonalSender
  ) {
    this.senders = new Map<string, MessageSender>([
      ["zalo_oa", this.zaloOa],
      ["facebook", this.facebook],
      ["zalo_personal", this.zaloPersonal],
    ])
  }

  get(provider: string): MessageSender | undefined {
    return this.senders.get(provider)
  }
}
