import { Test, TestingModule } from '@nestjs/testing'
import { BankSlipProcessUseCase } from '../bankslip-process.use-case'
import { RedisService } from '../../../services/redis.service'
import { MailService } from '../../../services/mail.service'
import { BankSlip } from '../../interface/bankslip.interface'
import { IBankSlipRepository } from '../../repository/interface/bankslip-repository.interface'

jest.mock('../../../services/redis.service')
jest.mock('../../../services/mail.service')

const bankSlips: BankSlip[] = [
  {
    governmentId: '123456',
    debtId: '789',
    email: 'test@example.com',
    debtAmount: 1000,
    debtDueDate: new Date('2025-12-31'),
    name: 'John Doe',
  },
]

describe('@unit ProcessBankSlipUseCase', () => {
  let bankSlipProcessUseCase: BankSlipProcessUseCase
  let redisService: RedisService
  let mailService: MailService
  let bankSlipRepository: IBankSlipRepository

  beforeEach(async () => {
    const mockBankSlipRepository = {
      save: jest.fn().mockResolvedValue(true),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankSlipProcessUseCase,
        RedisService,
        MailService,
        { provide: IBankSlipRepository, useValue: mockBankSlipRepository },
      ],
    }).compile()

    bankSlipProcessUseCase = module.get<BankSlipProcessUseCase>(BankSlipProcessUseCase)
    redisService = module.get<RedisService>(RedisService)
    mailService = module.get<MailService>(MailService)
    bankSlipRepository = module.get<IBankSlipRepository>(IBankSlipRepository)
  })

  it('should process bank slips if not already processed', async () => {
    redisService.exists = jest.fn().mockResolvedValue(false)
    redisService.save = jest.fn().mockResolvedValue(true)
    mailService.sendMail = jest.fn().mockResolvedValue(true)

    await bankSlipProcessUseCase.execute(bankSlips)

    expect(bankSlipRepository.save).toHaveBeenCalledWith(bankSlips[0])
    expect(mailService.sendMail).toHaveBeenCalledWith(bankSlips[0].email)
    expect(redisService.save).toHaveBeenCalledWith('processed:123456-789')
  })

  it('should not process already processed bank slips', async () => {
    redisService.exists = jest.fn().mockResolvedValue(true)

    await bankSlipProcessUseCase.execute(bankSlips)

    expect(bankSlipRepository.save).not.toHaveBeenCalled()
    expect(mailService.sendMail).not.toHaveBeenCalled()
    expect(redisService.save).not.toHaveBeenCalled()
  })

  it('should handle errors during processing', async () => {
    redisService.exists = jest.fn().mockResolvedValue(false)
    redisService.save = jest.fn().mockRejectedValue(new Error('Redis save failed'))

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    await bankSlipProcessUseCase.execute(bankSlips)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error processing bank slip:',
      expect.objectContaining({ message: 'Redis save failed' })
    )

    consoleErrorSpy.mockRestore()
  })
})
