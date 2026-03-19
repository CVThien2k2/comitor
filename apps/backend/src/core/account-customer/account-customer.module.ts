import { Module } from "@nestjs/common"
import { AccountCustomerService } from "./account-customer.service"
import { AccountCustomerController } from "./account-customer.controller"
import { GoldenProfileModule } from "../golden-profile/golden-profile.module"

@Module({
  imports: [GoldenProfileModule],
  controllers: [AccountCustomerController],
  providers: [AccountCustomerService],
  exports: [AccountCustomerService],
})
export class AccountCustomerModule {}
