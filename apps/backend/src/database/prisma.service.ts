import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common"
import { prisma } from "@workspace/database"
import type { PrismaClient } from "@workspace/database"

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client: PrismaClient = prisma
  private readonly logger = new Logger(PrismaService.name)

  async onModuleInit() {
    await this.connectWithRetry()
  }

  async onModuleDestroy() {
    await this.client.$disconnect()
  }

  private async connectWithRetry(retries = 5, delayMs = 2000): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.client.$connect()
        this.logger.log("Database connected")
        return
      } catch (error) {
        this.logger.warn(`Connection attempt ${attempt}/${retries} failed`)
        if (attempt === retries) throw error
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
      }
    }
  }
}
