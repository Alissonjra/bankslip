import { Injectable, Logger, OnModuleInit } from '@nestjs/common'

import { BANKSLIP_QUEUE, RabbitMQService } from './rabbitmq.service'
import { BankSlipProcessUseCase } from '../bankslip/use-cases/bankslip-process.use-case'

@Injectable()
export class ConsumerRabbitMQService implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly processBankSlipUseCase: BankSlipProcessUseCase
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.consume(BANKSLIP_QUEUE, this.processMessage.bind(this))
  }

  private async processMessage(msg: Record<string, any>) {
    try {
      const bankSlipData = JSON.parse(msg.content.toString())
      await this.processBankSlipUseCase.execute(bankSlipData)
    } catch (error) {
      Logger.error('Error processing RabbitMQ message:', error)
    }
  }
}
