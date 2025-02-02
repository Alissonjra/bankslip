import { Module } from '@nestjs/common'
import { BankSlipController } from './controllers/bankslip.controller'
import { BankSlipRepositoryProvider } from './repository/providers/bankslip-repository.provider'
import { RedisService } from '../services/redis.service'
import useCases from './use-cases'
import { IBankSlipRepository } from './repository/interface/bankslip-repository.interface'
import { MailService } from '../services/mail.service'
import { BankSlipProcessUseCase } from './use-cases/bankslip-process.use-case'
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module'

@Module({
  controllers: [BankSlipController],
  imports: [RabbitMQModule],
  providers: [RedisService, MailService, BankSlipRepositoryProvider, ...useCases],
  exports: [IBankSlipRepository, BankSlipProcessUseCase],
})
export class BankSlipModule {}
