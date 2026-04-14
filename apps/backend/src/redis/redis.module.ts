import { Module, Global } from "@nestjs/common"
import { RedisModule as NestRedisModule } from "@nestjs-modules/ioredis"
import { ConfigService } from "@nestjs/config"
import { RedisService } from "./redis.service"

@Global()
@Module({
  imports: [
    NestRedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: "single" as const,
        url: configService.get<string>("REDIS_URL", "redis://localhost:6379"),
        db: 0,
        options: {
          maxRetriesPerRequest: 3,
          retryStrategy(times: number) {
            if (times > 5) return 10_000
            return Math.min(times * 1000, 5000) // delay tăng dần, tối đa 5s
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  exports: [RedisService, NestRedisModule],
})
export class RedisModule {}
