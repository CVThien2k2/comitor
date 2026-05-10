import "dotenv/config"
import { join } from "path"
import { NestFactory } from "@nestjs/core"
import { ConfigService } from "@nestjs/config"
import { Logger, ValidationPipe } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import cookieParser from "cookie-parser"
import { AppModule } from "./app.module"
import { LoggerInterceptor } from "./common/interceptors/logger.interceptor"
import { ResponseInterceptor } from "./common/interceptors/response.interceptor"
import { HttpExceptionFilter } from "./common/filters/http-exception.filter"
import { NestExpressApplication } from "@nestjs/platform-express"
import { RedisIoAdapter } from "./websocket/redis-io.adapter"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)
  const httpAdapterHost = app.get(HttpAdapterHost)
  const logger = new Logger("Bootstrap")

  app.use(cookieParser())

  app.useStaticAssets(join(process.cwd(), "public"))
  app.enableCors({
    origin: configService.get<string>("FRONTEND_URL") ?? "http://localhost:3000",
    credentials: true,
  })

  const redisUrl = configService.get<string>("REDIS_URL", "redis://localhost:6379")
  if (redisUrl) {
    const isProduction = configService.get<string>("NODE_ENV") === "production"
    const redisIoAdapter = new RedisIoAdapter(redisUrl, app)
    await redisIoAdapter.connectToRedis({ required: isProduction })
    app.useWebSocketAdapter(redisIoAdapter)
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    })
  )
  app.useGlobalInterceptors(new LoggerInterceptor(), new ResponseInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapterHost))

  const config = new DocumentBuilder().setTitle("Comitor API").setVersion("1.0").addBearerAuth().build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("docs", app, document, {
    jsonDocumentUrl: "docs/json",
    yamlDocumentUrl: "docs/yaml",
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  const port = configService.get<number>("PORT") ?? 8000
  await app.listen(port)

  const env = configService.get("NODE_ENV", "development")
  logger.log(`Server is running on http://localhost:${port}`)
  logger.log(`Swagger: http://localhost:${port}/docs`)
  logger.log(`Swagger JSON: http://localhost:${port}/docs/json`)
  logger.log(`Swagger YAML: http://localhost:${port}/docs/yaml`)
  logger.log(`WebSocket: ws://localhost:${port}/websocket`)
  logger.log(`Environment: ${env}`)
}
bootstrap().catch(() => {
  process.exit(1)
})
