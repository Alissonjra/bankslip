import { BankSlip } from '../../interface/bankslip.interface'
import { validate } from '../bankslip.validator'

describe('@unit validate', () => {
  it('should validate a valid bank slip', () => {
    const validBankSlip: BankSlip = {
      name: 'John Doe',
      governmentId: '123456789',
      email: 'john.doe@example.com',
      debtAmount: 1000.0,
      debtDueDate: new Date(),
      debtId: 'e9b5d7f1-11c9-4edb-9f34-30a8b41861b4',
    }

    const result = validate(validBankSlip)

    expect(result.valid).toBe(true)
    expect(result.errors).toBeUndefined()
  })

  it('should return errors for invalid bank slip', () => {
    const invalidBankSlip: BankSlip = {
      name: '',
      governmentId: '123456789',
      email: 'invalidEmail',
      debtAmount: 1,
      debtDueDate: new Date(),
      debtId: 'invalidUuid',
    }

    const { valid, errors } = validate(invalidBankSlip)

    expect(valid).toBe(false)
    expect(errors).toBeDefined()

    expect(errors?.name).toBeDefined()
    expect(errors?.email).toBeDefined()
    expect(errors?.debtId).toBeDefined()
  })

  it('should return error for invalid UUID', () => {
    const invalidBankSlip: BankSlip = {
      name: 'John Doe',
      governmentId: '123456789',
      email: 'john.doe@example.com',
      debtAmount: 1000,
      debtDueDate: new Date(),
      debtId: 'invalidUuid',
    }

    const { valid, errors } = validate(invalidBankSlip)

    expect(valid).toBe(false)
    expect(errors?.debtId).toBeDefined()
  })
})
