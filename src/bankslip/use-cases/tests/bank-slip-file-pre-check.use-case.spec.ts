import * as fs from 'fs'
import { Test, TestingModule } from '@nestjs/testing'
import { BankSlipFilePreCheckUseCase } from '../bankslip-file-pre-check.use-case'
import { RedisService } from '../../../services/redis.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { UnprocessableEntityException, BadRequestException } from '@nestjs/common'

jest.mock('fs', () => ({
  unlinkSync: jest.fn(),
  createReadStream: jest.fn().mockReturnValue({
    on: jest.fn((event, callback) => {
      if (event === 'data') {
        callback('mocked data')
      }
      return { on: jest.fn() }
    }),
  }),
}))

jest.mock('../../../utils/hash.util.ts', () => ({
  generateHashFromFile: jest.fn().mockResolvedValue('validhash'),
}))

jest.setTimeout(10000)

describe('@unit BankSlipFilePreCheckUseCase', () => {
  let useCase: BankSlipFilePreCheckUseCase
  let redisService: RedisService
  let eventEmitter: EventEmitter2

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankSlipFilePreCheckUseCase, RedisService, EventEmitter2],
    }).compile()

    useCase = module.get<BankSlipFilePreCheckUseCase>(BankSlipFilePreCheckUseCase)
    redisService = module.get<RedisService>(RedisService)
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should throw error if file is not uploaded', async () => {
    const file = { path: '' } as Express.Multer.File
    await expect(useCase.execute(file)).rejects.toThrow(BadRequestException)
  })

  it('should throw error if file has already been processed', async () => {
    const file = { path: 'some-path' } as Express.Multer.File
    redisService.exists = jest.fn().mockResolvedValue(true)

    await expect(useCase.execute(file)).rejects.toThrow(BadRequestException)
    expect(fs.unlinkSync).toHaveBeenCalledWith(file.path)
  })

  it('should throw error if no file is provided', async () => {
    const file = null

    expect(() => useCase['throwExceptionIfFileWasNotUploaded'](file)).toThrow(
      UnprocessableEntityException
    )
  })

  it('should throw error if file has been already processed', async () => {
    const file = { path: 'file-path' } as Express.Multer.File
    const redisKey = 'filehash-processed'
    redisService.exists = jest.fn().mockResolvedValue(true)

    await expect(
      useCase['throwExceptionIfFileHasAlreadyBeenProcessed'](redisKey, file.path)
    ).rejects.toThrow(BadRequestException)
  })
})
