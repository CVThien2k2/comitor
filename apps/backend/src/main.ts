import "dotenv/config"
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
import { join } from "path"

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
  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, config))

  const port = configService.get<number>("PORT") ?? 8000
  await app.listen(port)

  const env = configService.get("NODE_ENV", "development")
  logger.log(`Server is running on http://localhost:${port}`)
  logger.log(`Swagger: http://localhost:${port}/docs`)
  logger.log(`WebSocket: ws://localhost:${port}/ws`)
  logger.log(`Environment: ${env}`)
}
bootstrap().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
