import { ClassProvider } from '@nestjs/common'

import { IBankSlipRepository } from '../interface/bankslip-repository.interface'
import { BankSlipRepository } from '../bankslip.repository'

export const BankSlipRepositoryProvider: ClassProvider = {
  provide: IBankSlipRepository,
  useClass: BankSlipRepository,
}
