import { Module } from "@nestjs/common"
import { AccountCustomerService } from "./account-customer.service"
import { AccountCustomerController } from "./account-customer.controller"

@Module({
  controllers: [AccountCustomerController],
  providers: [AccountCustomerService],
  exports: [AccountCustomerService],
})
export class AccountCustomerModule {}
