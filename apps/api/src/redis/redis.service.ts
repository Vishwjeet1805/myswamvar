import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis | null = null;

  getClient(): Redis {
    if (!this.client) {
      const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
      this.client = new Redis(url, { maxRetriesPerRequest: 3 });
    }
    return this.client;
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const c = this.getClient();
    if (ttlSeconds != null) {
      await c.setex(key, ttlSeconds, value);
    } else {
      await c.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.getClient().get(key);
  }

  async del(key: string): Promise<void> {
    await this.getClient().del(key);
  }
}
