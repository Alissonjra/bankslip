import * as fs from 'fs'
import * as csvParser from 'csv-parser'
import { validate } from '../../validator/bankslip.validator'
import { BankSlipFileProcessorUseCase } from '../../use-cases/bankslip-file-processor.use-case'
import { RedisService } from '../../../services/redis.service'
import { RabbitMQService } from '../../../rabbitmq/rabbitmq.service'

const mockInvalidRecord = {
  name: 'John Doe',
  governmentId: '123456',
  email: 'test@example.com',
  debtAmount: 1000,
  debtDueDate: '2025-12-31',
  debtId: 'invalid',
}

jest.mock('fs', () => ({
  createReadStream: jest.fn(),
  unlinkSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
}))

jest.mock('csv-parser', () =>
  jest.fn(() => ({
    pipe: jest.fn().mockReturnThis(),
    on: jest.fn().mockImplementation(function (
      this: any,
      event: string,
      callback: (data: any) => void
    ) {
      if (event === 'data') {
        callback(mockInvalidRecord)
      }
      if (event === 'end') {
        process.nextTick(callback)
      }
      return this
    }),
  }))
)

jest.mock('../../validator/bankslip.validator', () => ({
  validate: jest.fn(),
}))

describe('@unit BankSlipFileProcessorUseCase', () => {
  let useCase: BankSlipFileProcessorUseCase
  let rabbitMQService: RabbitMQService
  let redisService: RedisService
  let mockStream: any

  beforeEach(() => {
    rabbitMQService = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as unknown as RabbitMQService
    redisService = { remove: jest.fn() } as any
    useCase = new BankSlipFileProcessorUseCase(rabbitMQService, redisService)

    mockStream = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementation(function (
        this: any,
        event: string,
        callback: (data: any) => void
      ) {
        if (event === 'data') {
          callback(mockInvalidRecord)
        }
        if (event === 'end') {
          process.nextTick(callback)
        }
        return this
      }),
    }

    jest.spyOn(fs, 'createReadStream').mockImplementation(() => mockStream)
    ;(csvParser as jest.Mock).mockReturnValue(mockStream)
  })

  it('should handle invalid records and send them to DLQ', async () => {
    const mockFilePath = 'path/to/mock/file.csv'
    const mockRedisKey = 'mockRedisKey'

    const invalidRecords = [{ ...mockInvalidRecord, errors: ['Invalid debtId'] }]

    ;(validate as jest.Mock).mockReturnValue({
      valid: false,
      data: mockInvalidRecord,
      errors: ['Invalid debtId'],
    })

    await useCase.execute({
      payload: { filePath: mockFilePath, redisKey: mockRedisKey },
    })

    expect(invalidRecords.length).toEqual(1)
    expect(fs.unlinkSync).toHaveBeenCalledWith(mockFilePath)
  })
})
