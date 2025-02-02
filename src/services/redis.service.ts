import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'

const EXPIRE_DAYS = 15 * 24 * 60 * 60 // 15 days

@Injectable()
export class RedisService {
  readonly redis: Redis

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: 6379,
    })
  }

  async save(key: string): Promise<void> {
    await this.redis.set(key, '', 'EX', EXPIRE_DAYS)
  }

  async exists(key: string): Promise<boolean> {
    return Boolean(await this.redis.exists(key))
  }

  async remove(key: string): Promise<void> {
    await this.redis.del(key)
  }
}
