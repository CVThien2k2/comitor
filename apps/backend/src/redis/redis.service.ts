import { Injectable, OnModuleInit, Logger } from "@nestjs/common"
import { InjectRedis } from "@nestjs-modules/ioredis"
import Redis from "ioredis"

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name)

  constructor(@InjectRedis() private readonly redis: Redis) {}

  onModuleInit() {
    this.redis.on("connect", () => {
      this.logger.log("Redis connected")
    })

    this.redis.on("error", (error: Error) => {
      this.logger.error(`Redis connection error!`)
    })

    this.redis.on("close", () => {
      this.logger.warn("Redis connection closed")
    })

    this.redis.on("reconnecting", () => {
      this.logger.warn("Redis reconnecting!")
    })
  }

  /** Lấy giá trị theo key, tự parse JSON về object */
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      this.logger.error(`Redis GET "${key}" failed: ${(error as Error).message}`)
      return null
    }
  }

  /** Lưu giá trị theo key, tự stringify object. TTL tính bằng giây */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      if (ttlSeconds) {
        await this.redis.set(key, serialized, "EX", ttlSeconds)
      } else {
        await this.redis.set(key, serialized)
      }
    } catch (error) {
      this.logger.error(`Redis SET "${key}" failed: ${(error as Error).message}`)
    }
  }

  /** Xóa một hoặc nhiều key */
  async del(...keys: string[]): Promise<void> {
    try {
      await this.redis.del(...keys)
    } catch (error) {
      this.logger.error(`Redis DEL "${keys.join(", ")}" failed: ${(error as Error).message}`)
    }
  }

  /** Kiểm tra key có tồn tại không */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      this.logger.error(`Redis EXISTS "${key}" failed: ${(error as Error).message}`)
      return false
    }
  }

  /** Lấy thời gian sống còn lại của key (giây) */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key)
    } catch (error) {
      this.logger.error(`Redis TTL "${key}" failed: ${(error as Error).message}`)
      return -1
    }
  }
}
