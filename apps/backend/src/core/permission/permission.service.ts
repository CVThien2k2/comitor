import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../database/prisma.service"

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.permission.findMany({
      orderBy: { code: "asc" },
    })
  }
}
