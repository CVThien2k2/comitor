import { Body, Controller, Get, MessageEvent, Param, Post, Req, Request, Res, Sse } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger"
import type { Response } from "express"
import { map, Observable } from "rxjs"
import { Public } from "../common/decorators/public.decorator"
import { PlatformService } from "./platform.service"
import { ZaloOaService } from "./zalo-oa/zalo-oa.service"
import { ZaloService } from "./zalo/zalo.service"
import { Permissions } from "src/common/decorators/permissions.decorator"
import { P } from "@workspace/database"
import { MetaService } from "./meta/meta.service"

@ApiTags("Zalo personal")
@ApiBearerAuth()
@Controller("platform")
export class ZaloController {
  constructor(
    private readonly zaloService: ZaloService,
    private readonly platformService: PlatformService,
    private readonly zaloOaService: ZaloOaService,
    private readonly metaService: MetaService
  ) {}

  @Permissions(P.LINK_ACCOUNT_CREATE)
  @Get("/zalo/login")
  @ApiOperation({ summary: "Tạo QR đăng nhập Zalo cá nhân" })
  @ApiUnauthorizedResponse({ description: "Thiếu token hoặc token không hợp lệ" })
  async login(@Request() req: any) {
    return await this.zaloService.login(req.user.id)
  }

  @Public()
  @Get("/zalo-oa/connect")
  @ApiOperation({ summary: "Redirect tới trang cấp quyền Zalo OA" })
  connectZaloOa(@Res() res: Response) {
    return this.platformService.buildZaloOaConnectUrl(res)
  }

  @Permissions(P.LINK_ACCOUNT_CREATE)
  @Post("/zalo-oa/callback")
  @ApiOperation({ summary: "Nhận callback Zalo OA và tạo liên kết kênh" })
  zaloOaCallback(@Body() body: { code: string }, @Req() req: any) {
    return this.zaloOaService.connect(body.code, req.user.id)
  }

  @Public()
  @Get("/meta/connect")
  @ApiOperation({ summary: "Redirect tới trang cấp quyền Facebook" })
  connectMeta(@Res() res: Response) {
    return this.platformService.buildMetaConnectUrl(res)
  }

  @Permissions(P.LINK_ACCOUNT_CREATE)
  @Post("/meta/callback")
  @ApiOperation({ summary: "Nhận callback Facebook và tạo liên kết kênh" })
  metaCallback(@Body() body: { code: string }, @Req() req: any) {
    return this.metaService.connect(body.code, req.user.id)
  }

  @Public()
  @Sse("/zalo/login/events/:sessionId")
  @ApiOperation({ summary: "Theo dõi trạng thái đăng nhập Zalo cá nhân bằng SSE" })
  loginEvents(@Param("sessionId") sessionId: string): Observable<MessageEvent> {
    return this.zaloService.subscribeLoginEvents(sessionId).pipe(map((event) => ({ data: event })))
  }
}
