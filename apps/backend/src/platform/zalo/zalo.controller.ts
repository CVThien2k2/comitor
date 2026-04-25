import { Controller, Get, MessageEvent, Param, Request, Sse } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger"
import { map, Observable } from "rxjs"
import { Public } from "../../common/decorators/public.decorator"
import { ZaloService } from "./zalo.service"

@ApiTags("Zalo personal")
@ApiBearerAuth()
@Controller("zalo")
export class ZaloController {
  constructor(private readonly zaloService: ZaloService) {}

  @Get("/login")
  @ApiOperation({ summary: "Tạo QR đăng nhập Zalo cá nhân" })
  @ApiUnauthorizedResponse({ description: "Thiếu token hoặc token không hợp lệ" })
  async login(@Request() req: any) {
    return await this.zaloService.login(req.user.id)
  }

  @Public()
  @Sse("/login/events/:sessionId")
  @ApiOperation({ summary: "Theo dõi trạng thái đăng nhập Zalo cá nhân bằng SSE" })
  loginEvents(@Param("sessionId") sessionId: string): Observable<MessageEvent> {
    return this.zaloService.subscribeLoginEvents(sessionId).pipe(map((event) => ({ data: event })))
  }
}
