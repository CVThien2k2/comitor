import { Module } from "@nestjs/common"
import { ZaloOaService } from "./zalo_oa.service"
import { ZaloOaAuthService } from "./zalo_oa_auth.service"
import { UploadModule } from "src/upload/upload.module"
import { MetaService } from "./meta.service"
import { ApiController } from "./api.controller"

@Module({
  imports: [UploadModule],
  controllers: [ApiController],
  providers: [ZaloOaService, ZaloOaAuthService, MetaService],
  exports: [ZaloOaService, ZaloOaAuthService, MetaService],
})
export class ApiModule {}
