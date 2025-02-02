import { forwardRef, Global, Module } from '@nestjs/common'
import { RabbitMQService } from './rabbitmq.service'
import { ConsumerRabbitMQService } from './consumer.service'
import { BankSlipModule } from '../bankslip/bankslip.module'

@Global()
@Module({
  imports: [forwardRef(() => BankSlipModule)],
  providers: [RabbitMQService, ConsumerRabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
