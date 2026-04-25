// Lightweight exception classes for use in pure unit tests
// In the actual application, NestJS exceptions are used which extend these semantics

export class NotFoundException extends Error {
  readonly statusCode = 404;
  constructor(message?: string) { super(message || 'Not Found'); this.name = 'NotFoundException'; }
}
export class ConflictException extends Error {
  readonly statusCode = 409;
  constructor(message?: string) { super(message || 'Conflict'); this.name = 'ConflictException'; }
}
export class BadRequestException extends Error {
  readonly statusCode = 400;
  constructor(message?: string) { super(message || 'Bad Request'); this.name = 'BadRequestException'; }
}
export class ForbiddenException extends Error {
  readonly statusCode = 403;
  constructor(message?: string) { super(message || 'Forbidden'); this.name = 'ForbiddenException'; }
}
