import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../database/prisma.service"

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string) {
    return this.prisma.client.user.findUnique({
      where: { username },
      omit: { password: true },
    })
  }

  async findByUsernameWithPassword(username: string) {
    return this.prisma.client.user.findUnique({ where: { username } })
  }

  async findById(id: string) {
    return this.prisma.client.user.findUnique({
      where: { id },
      omit: { password: true },
    })
  }

  async findByIdWithRole(id: string) {
    return this.prisma.client.user.findUnique({
      where: { id },
      omit: { password: true },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    })
  }

  async findByIdWithPassword(id: string) {
    return this.prisma.client.user.findUnique({ where: { id } })
  }

  async setOnlineStatus(id: string, isOnline: boolean) {
    return this.prisma.client.user.update({
      where: { id },
      data: { isOnline },
    })
  }
}
