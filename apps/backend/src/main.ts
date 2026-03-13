import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000',
  })

  const port = configService.get<number>('PORT') ?? 8000
  await app.listen(port)
}
bootstrap().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
