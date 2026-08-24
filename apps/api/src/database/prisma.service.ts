import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  declare readonly deviceToken: any;

  async onModuleInit() {
    // Attempt connection gracefully without crashing server if DB is pending setup
    try {
      await this.$connect();
    } catch (e) {
      console.warn('Prisma DB connection deferred (database offline or initializing)');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
