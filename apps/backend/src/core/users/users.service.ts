import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../database/prisma.service"
import type { User } from "@workspace/database"

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({ where: { email } })
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({ where: { id } })
  }

  async create(data: {
    name: string
    email: string
    username?: string
  }): Promise<User> {
    return this.prisma.client.user.create({ data })
  }
}
