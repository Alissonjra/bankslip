import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as path from 'path'
import { RabbitMQService } from './rabbitmq/rabbitmq.service'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useStaticAssets(path.join(__dirname, '..', 'upload'), {
    prefix: '/upload',
  })

  const rabbitMQService = app.get(RabbitMQService)
  await rabbitMQService.connect()
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
