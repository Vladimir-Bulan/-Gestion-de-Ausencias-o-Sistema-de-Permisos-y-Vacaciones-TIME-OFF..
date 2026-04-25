// In production, this is just @nestjs/common
// Kept as a shim so services are decoupled from NestJS in tests
export {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
