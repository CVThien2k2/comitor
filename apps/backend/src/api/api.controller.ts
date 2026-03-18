import { Body, Controller, Post } from "@nestjs/common"
import { MetaService } from "./meta.service"
import { SendMessagePayload } from "src/utils/types/message"
import { Public } from "src/common/decorators/public.decorator"

@Controller("api")
export class ApiController {
  constructor(private readonly metaService: MetaService) {}

  @Post("/meta/send-message")
  @Public()
  sendMessage(@Body() payload: SendMessagePayload) {
    return this.metaService.sendMessage(payload)
  }
}
