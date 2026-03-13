import { Controller, Get } from '@nestjs/common'
import type { ApiResponse, UserProfile } from '@workspace/shared/types'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('users')
  getUsers(): ApiResponse<UserProfile[]> {
    return this.appService.getUsers()
  }
}
