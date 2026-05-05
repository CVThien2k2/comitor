import { Module } from "@nestjs/common"
import { AgentLevelController } from "./agent-level.controller"
import { AgentLevelService } from "./agent-level.service"

@Module({
  controllers: [AgentLevelController],
  providers: [AgentLevelService],
})
export class AgentLevelModule {}
