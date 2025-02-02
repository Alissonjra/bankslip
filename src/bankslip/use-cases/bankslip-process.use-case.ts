import { Injectable, Logger } from '@nestjs/common'

import { RedisService } from '../../services/redis.service'
import { MailService } from '../../services/mail.service'
import { IBankSlipRepository } from '../repository/interface/bankslip-repository.interface'
import { BankSlip } from '../interface/bankslip.interface'

@Injectable()
export class BankSlipProcessUseCase {
  constructor(
    private readonly redisService: RedisService,
    private readonly bankSlipRepository: IBankSlipRepository,
    private readonly mailService: MailService
  ) {}

  async execute(bankSlips: BankSlip[]): Promise<void> {
    for (const bankSlip of bankSlips) {
      try {
        const redisKey = `processed:${bankSlip.governmentId}-${bankSlip.debtId}`
        const alreadyProcessed = await this.redisService.exists(redisKey)
        if (!alreadyProcessed) {
          await this.bankSlipRepository.save(bankSlip)
          await this.mailService.sendMail(bankSlip.email)
          await this.redisService.save(redisKey)

          Logger.log(
            `BankSlip ${bankSlip.governmentId} by user: ${bankSlip.email} register successfully!`
          )
        }
      } catch (error) {
        console.error('Error processing bank slip:', error)
        Logger.error('Error processing bank slip:', error)
      }
    }
  }
}
