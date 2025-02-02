import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { BankSlipFilePreCheckUseCase } from '../use-cases/bankslip-file-pre-check.use-case'

@Controller('upload')
export class BankSlipController {
  constructor(
    private readonly bankSlipFilePreCheckUseCase: BankSlipFilePreCheckUseCase
  ) {}

  @Post('boleto')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async uploadBankSlip(@UploadedFile() file: Express.Multer.File) {
    return await this.bankSlipFilePreCheckUseCase.execute(file)
  }
}
