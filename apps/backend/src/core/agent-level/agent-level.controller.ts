import { Body, Controller, Delete, Get, Param, Patch, Post, Request, Query } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger"
import type { User } from "@workspace/database"
import { P } from "@workspace/database"
import { Permissions } from "../../common/decorators/permissions.decorator"
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto"
import {
  ApiPaginatedResponseOf,
  ApiResponseOf,
  MessageResponseEntity,
} from "../../common/entities/api-response.entity"
import { AgentLevelEntity } from "./entities/agent-level.entity"
import { AgentLevelService } from "./agent-level.service"
import { CreateAgentLevelDto } from "./dto/create-agent-level.dto"
import { UpdateAgentLevelDto } from "./dto/update-agent-level.dto"
import type { Request as ExpressRequest } from "express"

interface RequestWithUser extends ExpressRequest {
  user: User
}

@ApiTags("AgentLevels")
@ApiBearerAuth()
@Controller("agent-levels")
export class AgentLevelController {
  constructor(private readonly agentLevelService: AgentLevelService) {}

  @ApiOperation({ summary: "Lấy danh sách cấp độ nhân viên" })
  @ApiOkResponse({ type: ApiPaginatedResponseOf(AgentLevelEntity) })
  @Permissions(P.AGENT_LEVEL_READ)
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.agentLevelService.findAll(query)
    return { message: "Lấy danh sách cấp độ nhân viên thành công", data }
  }

  @ApiOperation({ summary: "Lấy thông tin cấp độ nhân viên theo ID" })
  @ApiOkResponse({ type: ApiResponseOf(AgentLevelEntity) })
  @Permissions(P.AGENT_LEVEL_READ)
  @Get(":id")
  async findById(@Param("id") id: string) {
    const data = await this.agentLevelService.findById(id)
    return { message: "Lấy thông tin cấp độ nhân viên thành công", data }
  }

  @ApiOperation({ summary: "Tạo cấp độ nhân viên mới" })
  @ApiOkResponse({ type: ApiResponseOf(AgentLevelEntity) })
  @Permissions(P.AGENT_LEVEL_CREATE)
  @Post()
  async create(@Body() dto: CreateAgentLevelDto, @Request() req: RequestWithUser) {
    const data = await this.agentLevelService.create(dto, req.user.id)
    return { message: "Tạo cấp độ nhân viên thành công", data }
  }

  @ApiOperation({ summary: "Cập nhật cấp độ nhân viên" })
  @ApiOkResponse({ type: ApiResponseOf(AgentLevelEntity) })
  @Permissions(P.AGENT_LEVEL_UPDATE)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateAgentLevelDto) {
    const data = await this.agentLevelService.update(id, dto)
    return { message: "Cập nhật cấp độ nhân viên thành công", data }
  }

  @ApiOperation({ summary: "Xóa cấp độ nhân viên" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @Permissions(P.AGENT_LEVEL_DELETE)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.agentLevelService.delete(id)
    return { message: "Xóa cấp độ nhân viên thành công" }
  }
}
