import { BankSlip } from '../../interface/bankslip.interface'

export abstract class IBankSlipRepository {
  abstract save(bankslip: BankSlip): Promise<void>
}
