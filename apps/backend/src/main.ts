import "dotenv/config"
import { NestFactory } from "@nestjs/core"
import { ConfigService } from "@nestjs/config"
import { ValidationPipe } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import cookieParser from "cookie-parser"
import { AppModule } from "./app.module"
import { LoggerInterceptor } from "./common/interceptors/logger.interceptor"
import { ResponseInterceptor } from "./common/interceptors/response.interceptor"
import { HttpExceptionFilter } from "./common/filters/http-exception.filter"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  app.use(cookieParser())

  app.enableCors({
    origin:
      configService.get<string>("FRONTEND_URL") ?? "http://localhost:3000",
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    })
  )
  app.useGlobalInterceptors(new LoggerInterceptor(), new ResponseInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())

  const config = new DocumentBuilder()
    .setTitle("Comitor API")
    .setVersion("1.0")
    .addBearerAuth()
    .build()
  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, config))

  const port = configService.get<number>("PORT") ?? 8000
  await app.listen(port)

  console.log(`🚀 Server is running on http://localhost:${port}`)
  console.log(`📚 Swagger: http://localhost:${port}/docs`)
  console.log(`📧 Environment: ${configService.get("NODE_ENV", "development")}`)
}
bootstrap().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
