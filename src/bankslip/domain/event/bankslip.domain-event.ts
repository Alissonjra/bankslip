export enum BankSlipEvent {
  UploadedFile = 'bankslip-event.uploaded',
}

export interface BankSlipEventPayload {
  filePath: string
  redisKey: string
}

export class BankSlipDomainEvent {
  payload: BankSlipEventPayload

  constructor(payload: BankSlipEventPayload) {
    this.payload = payload
  }
}
