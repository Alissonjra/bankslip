import * as fs from 'fs'
import * as csvParser from 'csv-parser'
import { validate } from '../validator/bankslip.validator'

import { RedisService } from '../../services/redis.service'
import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { BankSlipDomainEvent, BankSlipEvent } from '../domain/event/bankslip.domain-event'

import {
  RabbitMQService,
  BANKSLIP_DLQ,
  BANKSLIP_QUEUE,
} from '../../rabbitmq/rabbitmq.service'
import { BankSlip } from '../interface/bankslip.interface'

const CHUNK_SIZE = 500

@Injectable()
export class BankSlipFileProcessorUseCase {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly redisService: RedisService
  ) {}

  @OnEvent(BankSlipEvent.UploadedFile, { async: true })
  async execute({ payload: { filePath, redisKey } }: BankSlipDomainEvent): Promise<void> {
    const stream = fs.createReadStream(filePath).pipe(
      csvParser({
        headers: ['name', 'governmentId', 'email', 'debtAmount', 'debtDueDate', 'debtId'],
        separator: ';',
        mapHeaders: ({ header }) => header.trim(),
      })
    )

    const validRecords: BankSlip[] = []
    const invalidRecords: Record<string, []>[] = []
    let skipHeader = false

    return new Promise<void>((resolve, reject) => {
      stream
        .on('data', async (row) => {
          if (skipHeader) {
            this.validateRecords(row, validRecords, invalidRecords)
            if (validRecords.length >= CHUNK_SIZE) {
              this.publishToRabbitMQ(validRecords)
              validRecords.length = 0
            }
          } else {
            skipHeader = true
          }
        })
        .on('end', async () => {
          await this.handleEndOfFile(validRecords, invalidRecords)
          this.removeFile(filePath)
          resolve()
        })
        .on('error', async (error) => {
          Logger.error('Error processing the file:', error)
          await this.redisService.remove(redisKey)
          this.removeFile(filePath)
          reject(error)
        })
    })
  }

  private validateRecords(
    bankSlip: BankSlip,
    validRecords: BankSlip[],
    invalidRecords: Record<string, any>[]
  ) {
    const { valid, data, errors } = validate(bankSlip)
    valid && data ? validRecords.push(data) : invalidRecords.push({ ...bankSlip, errors })
  }

  private async publishToRabbitMQ(validRecords: BankSlip[]) {
    try {
      await this.rabbitMQService.publish(BANKSLIP_QUEUE, validRecords)
    } catch (error) {
      Logger.error('Error sending to RabbitMQ:', error)
    }
  }

  private async handleEndOfFile(
    validRecords: BankSlip[],
    invalidRecords: Record<string, []>[]
  ) {
    if (validRecords.length > 0) {
      await this.rabbitMQService.publish(BANKSLIP_QUEUE, validRecords)
    }
    await this.processInvalidRecords(invalidRecords)
    Logger.log('Finished file processing')
  }

  private async processInvalidRecords(invalidRecords: Record<string, []>[]) {
    if (invalidRecords.length > 0) {
      await this.rabbitMQService.publish(BANKSLIP_DLQ, invalidRecords)
    }
  }

  private removeFile(filePath: string) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
}
