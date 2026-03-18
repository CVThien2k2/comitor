import { Module } from "@nestjs/common"
import { ZaloOaService } from "./zalo_oa.service"
import { UploadModule } from "src/upload/upload.module"
import { MetaService } from "./meta.service"

@Module({
  imports: [UploadModule],
  controllers: [],
  providers: [ZaloOaService, MetaService],
  exports: [ZaloOaService, MetaService],
})
export class ApiModule {}
