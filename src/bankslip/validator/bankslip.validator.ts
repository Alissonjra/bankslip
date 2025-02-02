import { z } from 'zod'
import { BankSlip } from '../interface/bankslip.interface'

const bankSlipSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, 'Invalid name'),
  governmentId: z.string(),
  email: z.string().email('Invalid email'),
  debtAmount: z
    .union([z.string(), z.number()])
    .transform((value) => (typeof value === 'string' ? parseFloat(value) : value)),
  debtDueDate: z.union([z.string(), z.number(), z.date()]).transform((value) => {
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }
    return date
  }),
  debtId: z.string().uuid('Invalid UUID'),
})

export function validate(bankSlip: BankSlip) {
  const result = bankSlipSchema.safeParse(bankSlip)
  if (!result.success) {
    return { valid: false, errors: result.error.format() }
  }
  return { valid: true, data: result.data }
}
