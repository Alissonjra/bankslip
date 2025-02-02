import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { BankSlip } from '../interface/bankslip.interface'

@Injectable()
export class BankSlipRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(bankSlip: BankSlip) {
    return this.prismaService.bankslip.create({ data: bankSlip })
  }
}
