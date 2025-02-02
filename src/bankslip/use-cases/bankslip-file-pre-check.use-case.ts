import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common'
import { RedisService } from '../../services/redis.service'
import { generateHashFromFile } from '../../utils/hash.util'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { BankSlipDomainEvent, BankSlipEvent } from '../domain/event/bankslip.domain-event'
import * as fs from 'fs'

@Injectable()
export class BankSlipFilePreCheckUseCase {
  constructor(
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(file: Express.Multer.File): Promise<{
    message: string
  }> {
    this.throwExceptionIfFileWasNotUploaded(file)

    const hash = await generateHashFromFile(file.path)
    const redisKey = `filehash-${hash}`
    await this.throwExceptionIfFileHasAlreadyBeenProcessed(redisKey, file.path)
    await this.redisService.save(redisKey)
    await this.emitEvent(file.path, redisKey)

    return { message: 'File sent for processing...' }
  }

  private throwExceptionIfFileWasNotUploaded(file: Express.Multer.File | null): void {
    if (!file) throw new UnprocessableEntityException('No file was uploaded')
  }

  private async throwExceptionIfFileHasAlreadyBeenProcessed(
    keyName: string,
    filePath: string
  ): Promise<void> {
    const alreadyProcessed = await this.redisService.exists(keyName)
    if (alreadyProcessed) {
      fs.unlinkSync(filePath)
      throw new BadRequestException('This file has already been processed.')
    }
  }

  private async emitEvent(filePath: string, redisKey: string) {
    await this.eventEmitter.emitAsync(
      BankSlipEvent.UploadedFile,
      new BankSlipDomainEvent({
        filePath,
        redisKey,
      })
    )
  }
}
