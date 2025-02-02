import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { BankSlipModule } from './bankslip/bankslip.module'
import { EventEmitterModule } from '@nestjs/event-emitter'

@Module({
  imports: [PrismaModule, BankSlipModule, EventEmitterModule.forRoot()],
  providers: [],
})
export class AppModule {}
