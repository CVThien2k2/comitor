import { Module } from "@nestjs/common"
import { ZaloOaService } from "./zalo_oa.service"
import { UploadModule } from "src/upload/upload.module"
import { MetaService } from "./meta.service"
import { ApiController } from "./api.controller"

@Module({
  imports: [UploadModule],
  controllers: [ApiController],
  providers: [ZaloOaService, MetaService],
  exports: [ZaloOaService, MetaService],
})
export class ApiModule {}
