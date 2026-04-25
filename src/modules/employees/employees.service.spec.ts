jest.mock('src/common/nestjs-shim', () => ({
  Injectable: () => () => {},
  Logger: class { log() {} warn() {} error() {} },
  NotFoundException: class NotFoundException extends Error {
    constructor(msg?: string) { super(msg || 'Not Found'); this.name = 'NotFoundException'; }
  },
  ConflictException: class ConflictException extends Error {
    constructor(msg?: string) { super(msg || 'Conflict'); this.name = 'ConflictException'; }
  },
  BadRequestException: class BadRequestException extends Error {
    constructor(msg?: string) { super(msg || 'Bad Request'); this.name = 'BadRequestException'; }
  },
  ForbiddenException: class ForbiddenException extends Error {
    constructor(msg?: string) { super(msg || 'Forbidden'); this.name = 'ForbiddenException'; }
  },
}));

import { EmployeesService } from './employees.service';
import { EmployeeRepository } from './employees.repository';
import { EmployeeRecord } from '../../common/types/domain.types';

const alice: EmployeeRecord = {
  id: 'uuid-1', name: 'Alice Johnson', email: 'alice@wizdaa.com',
  role: 'EMPLOYEE', managerId: null, createdAt: new Date(), updatedAt: new Date(),
};
const mgr: EmployeeRecord = {
  id: 'uuid-mgr', name: 'Sarah Connor', email: 'sarah@wizdaa.com',
  role: 'MANAGER', managerId: null, createdAt: new Date(), updatedAt: new Date(),
};

const makeRepo = (): jest.Mocked<EmployeeRepository> => ({
  findAll: jest.fn(), findById: jest.fn(), findByEmail: jest.fn(),
  findReports: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(),
} as any);

describe('EmployeesService', () => {
  let service: EmployeesService;
  let repo: jest.Mocked<EmployeeRepository>;

  beforeEach(() => { repo = makeRepo(); service = new EmployeesService(repo); });

  describe('findAll', () => {
    it('returns all employees', async () => {
      repo.findAll.mockResolvedValue([alice]);
      expect(await service.findAll()).toHaveLength(1);
    });
    it('returns empty array when no employees', async () => {
      repo.findAll.mockResolvedValue([]);
      expect(await service.findAll()).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('returns employee by id', async () => {
      repo.findById.mockResolvedValue(alice);
      expect((await service.findOne('uuid-1')).email).toBe('alice@wizdaa.com');
    });
    it('propagates NotFoundException for unknown id', async () => {
      repo.findById.mockRejectedValue(new Error('Not Found'));
      await expect(service.findOne('bad-id')).rejects.toThrow('Not Found');
    });
  });

  describe('create', () => {
    it('creates employee successfully', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockResolvedValue(alice);
      expect((await service.create({ name: 'Alice', email: 'alice@wizdaa.com' })).name).toBe('Alice Johnson');
    });
    it('throws on duplicate email', async () => {
      repo.findByEmail.mockResolvedValue(alice);
      await expect(service.create({ name: 'Alice 2', email: 'alice@wizdaa.com' })).rejects.toThrow(/Conflict|already exists/i);
    });
    it('validates manager exists when managerId provided', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findById.mockResolvedValue(mgr);
      repo.create.mockResolvedValue({ ...alice, managerId: 'uuid-mgr' });
      await service.create({ name: 'Alice', email: 'alice@wizdaa.com', managerId: 'uuid-mgr' });
      expect(repo.findById).toHaveBeenCalledWith('uuid-mgr');
    });
  });

  describe('update', () => {
    it('updates employee fields', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...alice, name: 'Alice Updated' });
      const result = await service.update({ id: 'uuid-1', name: 'Alice Updated' });
      expect(result.name).toBe('Alice Updated');
    });
    it('throws on email taken by another employee', async () => {
      repo.findByEmail.mockResolvedValue({ ...alice, id: 'uuid-other' });
      await expect(service.update({ id: 'uuid-1', email: 'alice@wizdaa.com' })).rejects.toThrow(/Conflict|already taken/i);
    });
  });

  describe('remove', () => {
    it('deletes and returns employee', async () => {
      repo.delete.mockResolvedValue(alice);
      expect((await service.remove('uuid-1')).id).toBe('uuid-1');
    });
  });
});
