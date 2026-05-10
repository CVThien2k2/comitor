import { IoAdapter } from "@nestjs/platform-socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import Redis from "ioredis"
import { Logger } from "@nestjs/common"

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>
  private readonly logger = new Logger(RedisIoAdapter.name)
  private redisPubClient: Redis | null = null
  private redisSubClient: Redis | null = null

  constructor(
    private readonly redisUrl: string,
    appOrHttpServer: any
  ) {
    super(appOrHttpServer)
  }

  async connectToRedis(options?: { required?: boolean }): Promise<void> {
    const required = options?.required ?? false

    if (!this.redisUrl) {
      const message = "REDIS_URL chưa được cấu hình, Socket.IO sẽ chạy với memory adapter"
      if (required) {
        throw new Error(message)
      }
      this.logger.warn(message)
      return
    }

    try {
      this.redisPubClient = new Redis(this.redisUrl, {
        lazyConnect: true,
        db: 2,
        enableOfflineQueue: false,
        maxRetriesPerRequest: null,
        retryStrategy(times: number) {
          if (times > 5) return 10_000
          return Math.min(times * 1000, 5000)
        },
      })
      this.redisSubClient = this.redisPubClient.duplicate()

      this.redisPubClient.on("error", (error: Error) => {
        this.logger.error(`Socket Redis pub error: ${error.message}`)
      })
      this.redisSubClient.on("error", (error: Error) => {
        this.logger.error(`Socket Redis sub error: ${error.message}`)
      })

      await Promise.all([this.redisPubClient.connect(), this.redisSubClient.connect()])
      this.adapterConstructor = createAdapter(this.redisPubClient, this.redisSubClient)
      this.logger.log("Socket.IO Redis adapter đã được kết nối")
    } catch (error) {
      const message = `Không thể bật Socket.IO Redis adapter: ${(error as Error).message}`
      if (required) {
        throw new Error(message)
      }
      this.logger.error(message)
      this.logger.warn("Socket.IO sẽ fallback sang memory adapter")
    }
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options)
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor)
    }
    return server
  }

  async close(server: any): Promise<void> {
    this.redisPubClient?.disconnect()
    this.redisSubClient?.disconnect()
    super.close(server)
  }
}
