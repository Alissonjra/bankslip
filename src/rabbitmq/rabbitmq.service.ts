import { Injectable, Logger } from '@nestjs/common'
import * as amqp from 'amqplib'

export const BANKSLIP_QUEUE = 'bankslip_queue'
export const BANKSLIP_DLQ = 'bankslip_dql'

@Injectable()
export class RabbitMQService {
  private connection!: amqp.Connection
  private channel!: amqp.Channel

  async connect(): Promise<void> {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL ?? 'amqp://rabbitmq')
    this.channel = await this.connection.createChannel()
    await this.channel.assertQueue(BANKSLIP_QUEUE)
    await this.channel.assertQueue(BANKSLIP_DLQ)
  }

  async publish(queue: string, message: Record<string, any>): Promise<void> {
    this.throwExceptionIfChannelNotInitialized()
    Logger.log(`Publish message in queue: ${queue}`)
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
  }

  async close(): Promise<void> {
    await this.channel.close()
    await this.connection.close()
  }

  async consume(
    queue: string,
    callback: (msg: amqp.ConsumeMessage) => void
  ): Promise<void> {
    this.throwExceptionIfChannelNotInitialized()
    Logger.log(`Consuming messages from ${queue}`)
    await this.channel.consume(queue, (msg) => {
      if (msg) {
        callback(msg)
        this.channel.ack(msg)
      }
    })
  }

  private throwExceptionIfChannelNotInitialized() {
    if (!this.channel) {
      throw new Error('RabbitMQ not initialized.')
    }
  }
}
