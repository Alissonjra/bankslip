import { BankSlipFileProcessorUseCase } from './bankslip-file-processor.use-case'
import { BankSlipFilePreCheckUseCase } from './bankslip-file-pre-check.use-case'
import { BankSlipProcessUseCase } from './bankslip-process.use-case'

export default [
  BankSlipFilePreCheckUseCase,
  BankSlipFileProcessorUseCase,
  BankSlipProcessUseCase,
]
