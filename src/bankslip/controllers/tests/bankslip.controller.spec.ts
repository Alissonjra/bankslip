import { Test, TestingModule } from '@nestjs/testing'
import { MulterModule } from '@nestjs/platform-express'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as fs from 'fs'
import * as path from 'path'
import { BankSlipFilePreCheckUseCase } from '../../../bankslip/use-cases/bankslip-file-pre-check.use-case'
import { BankSlipController } from '../bankslip.controller'

jest.mock('../../../bankslip/use-cases/bankslip-file-pre-check.use-case')

describe('@integration BankSlipController', () => {
  let app: INestApplication
  let bankSlipFilePreCheckUseCase: BankSlipFilePreCheckUseCase
  const filePath = path.join(__dirname, 'mock', 'fileMock.csv')

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MulterModule.register({
          dest: './uploads',
        }),
      ],
      controllers: [BankSlipController],
      providers: [
        {
          provide: BankSlipFilePreCheckUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue('File processed successfully'),
          },
        },
      ],
    }).compile()

    app = module.createNestApplication()
    await app.init()
    bankSlipFilePreCheckUseCase = module.get<BankSlipFilePreCheckUseCase>(
      BankSlipFilePreCheckUseCase
    )
  })

  afterAll(async () => {
    await app.close()
    const uploadDir = path.join(__dirname, '../../../../uploads')

    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir)

      files.forEach((file) => {
        const filePath = path.join(uploadDir, file)
        fs.unlinkSync(filePath)
      })
    }
  })

  it('should upload a file and process it', async () => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found ${filePath}`)
    }

    const response = await request(app.getHttpServer())
      .post('/upload/boleto')
      .attach('file', filePath)
      .expect(201)

    expect(response.text).toBe('File processed successfully')

    expect(bankSlipFilePreCheckUseCase.execute).toHaveBeenCalled()
    expect(bankSlipFilePreCheckUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: './uploads',
        encoding: '7bit',
        fieldname: 'file',
        mimetype: 'text/csv',
        originalname: 'fileMock.csv',
      })
    )
  })
})
