import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../database/prisma.service"
import type { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import { paginate, paginatedResponse } from "../../utils/paginate"
import { CreateAgentLevelDto } from "./dto/create-agent-level.dto"
import { UpdateAgentLevelDto } from "./dto/update-agent-level.dto"

@Injectable()
export class AgentLevelService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query)

    const where = {
      isDeleted: false,
      ...(query.search
        ? {
            OR: [
              { code: { contains: query.search, mode: "insensitive" as const } },
              { description: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [items, total] = await Promise.all([
      this.prisma.client.agentLevel.findMany({
        where,
        orderBy: { yearsOfExperience: "asc" },
        skip,
        take,
      }),
      this.prisma.client.agentLevel.count({ where }),
    ])

    return paginatedResponse(items, total, page, limit)
  }

  async findById(id: string) {
    const item = await this.prisma.client.agentLevel.findFirst({
      where: { id, isDeleted: false },
    })

    if (!item) throw new NotFoundException("Cấp độ nhân viên không tồn tại")

    return item
  }

  async create(dto: CreateAgentLevelDto, createdBy: string) {
    const normalizedCode = dto.code.trim()
    const normalizedDescription = dto.description.trim()

    const existing = await this.prisma.client.agentLevel.findUnique({
      where: { code: normalizedCode },
    })

    if (existing && !existing.isDeleted) {
      throw new ConflictException("Mã cấp độ nhân viên đã tồn tại")
    }

    if (existing?.isDeleted) {
      return this.prisma.client.agentLevel.update({
        where: { id: existing.id },
        data: {
          code: normalizedCode,
          description: normalizedDescription,
          yearsOfExperience: dto.yearsOfExperience,
          maxConcurrentConversations: dto.maxConcurrentConversations,
          isDeleted: false,
          createdBy,
        },
      })
    }

    return this.prisma.client.agentLevel.create({
      data: {
        code: normalizedCode,
        description: normalizedDescription,
        yearsOfExperience: dto.yearsOfExperience,
        maxConcurrentConversations: dto.maxConcurrentConversations,
        createdBy,
      },
    })
  }

  async update(id: string, dto: UpdateAgentLevelDto) {
    const existing = await this.prisma.client.agentLevel.findFirst({
      where: { id, isDeleted: false },
    })

    if (!existing) throw new NotFoundException("Cấp độ nhân viên không tồn tại")

    const nextCode = dto.code?.trim()
    if (nextCode && nextCode !== existing.code) {
      const duplicate = await this.prisma.client.agentLevel.findUnique({
        where: { code: nextCode },
      })

      if (duplicate && duplicate.id !== id && !duplicate.isDeleted) {
        throw new ConflictException("Mã cấp độ nhân viên đã tồn tại")
      }
    }

    return this.prisma.client.agentLevel.update({
      where: { id },
      data: {
        ...(nextCode !== undefined ? { code: nextCode } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.yearsOfExperience !== undefined ? { yearsOfExperience: dto.yearsOfExperience } : {}),
        ...(dto.maxConcurrentConversations !== undefined
          ? { maxConcurrentConversations: dto.maxConcurrentConversations }
          : {}),
      },
    })
  }

  async delete(id: string) {
    const existing = await this.prisma.client.agentLevel.findFirst({
      where: { id, isDeleted: false },
    })

    if (!existing) throw new NotFoundException("Cấp độ nhân viên không tồn tại")

    const usedByUsers = await this.prisma.client.user.count({
      where: { agentLevelId: id, isDeleted: false },
    })

    if (usedByUsers > 0) {
      throw new ConflictException("Không thể xóa cấp độ đang được gán cho người dùng")
    }

    await this.prisma.client.agentLevel.update({
      where: { id },
      data: { isDeleted: true },
    })
  }
}
