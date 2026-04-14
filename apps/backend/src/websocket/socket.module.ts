import { Global, Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { RoleModule } from "../core/role/role.module"
import { SocketGateway } from "./socket.gateway"

@Global()
@Module({
  imports: [
    ConfigModule,
    RoleModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
      }),
    }),
  ],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
