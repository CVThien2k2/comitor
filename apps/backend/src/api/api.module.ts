import { Module } from "@nestjs/common"
import { ZaloOaService } from "./zalo_oa.service"
import { UploadModule } from "src/upload/upload.module"

@Module({
  imports: [UploadModule],
  controllers: [],
  providers: [ZaloOaService],
  exports: [ZaloOaService],
})
export class ApiModule {}
