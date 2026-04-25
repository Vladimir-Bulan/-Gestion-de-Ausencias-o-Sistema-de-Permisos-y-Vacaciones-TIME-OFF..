import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from 'src/common/nestjs-shim';

// PrismaClient is imported dynamically to support environments without generated client
// In production, run: npx prisma generate && npx prisma migrate dev
let PrismaClient: any;
try {
  PrismaClient = require('@prisma/client').PrismaClient;
} catch {
  PrismaClient = null;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private client: any;

  constructor() {
    if (PrismaClient) {
      this.client = new PrismaClient({ log: ['warn', 'error'] });
    }
  }

  get employee() { return this.client?.employee; }
  get timeOffRequest() { return this.client?.timeOffRequest; }
  get leaveBalance() { return this.client?.leaveBalance; }

  async $connect() { return this.client?.$connect(); }
  async $disconnect() { return this.client?.$disconnect(); }

  async onModuleInit(): Promise<void> {
    if (this.client) {
      await this.client.$connect();
      this.logger.log('Database connection established');
    } else {
      this.logger.warn('Prisma client not available - run: npx prisma generate');
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.$disconnect();
  }
}
