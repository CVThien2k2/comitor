import { Injectable } from "@nestjs/common"
import type { ApiResponse, UserProfile } from "@workspace/shared/types"
import { PrismaService } from "./prisma.service"
import { User } from "@workspace/database"

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return "Hello World!"
  }

  async getUsers(): Promise<ApiResponse<UserProfile[]>> {
    const users = await this.prisma.client.user.findMany()
    return {
      success: true,
      data: users.map((u: User) => ({
        id: u.id,
        email: u.email,
        username: u.username,
      })),
    }
  }
}
