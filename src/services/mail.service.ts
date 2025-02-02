import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class MailService {
  async sendMail(email: string): Promise<void> {
    Logger.log(`Send email to user: ${email}`)
  }
}
