jest.mock('src/common/nestjs-shim', () => ({
  Injectable: () => () => {},
  Logger: class { log() {} warn() {} error() {} },
  NotFoundException: class extends Error { constructor(m?: string) { super(m||'Not Found'); this.name='NotFoundException'; } },
  ConflictException: class extends Error { constructor(m?: string) { super(m||'Conflict'); this.name='ConflictException'; } },
  BadRequestException: class extends Error { constructor(m?: string) { super(m||'Bad Request'); this.name='BadRequestException'; } },
  ForbiddenException: class extends Error { constructor(m?: string) { super(m||'Forbidden'); this.name='ForbiddenException'; } },
}));

import { TimeOffRequestsService } from './time-off-requests.service';
import { TimeOffRequestRepository } from './time-off-requests.repository';
import { LeaveBalanceService } from '../leave-balance/leave-balance.service';
import { EmployeesService } from '../employees/employees.service';
import { TimeOffRequestRecord, EmployeeRecord } from '../../common/types/domain.types';

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const employee: EmployeeRecord = {
  id: 'emp-1', name: 'Alice', email: 'alice@test.com', role: 'EMPLOYEE',
  managerId: 'mgr-1', createdAt: new Date(), updatedAt: new Date(),
};
const manager: EmployeeRecord = {
  id: 'mgr-1', name: 'Sarah', email: 'sarah@test.com', role: 'MANAGER',
  managerId: null, createdAt: new Date(), updatedAt: new Date(),
};
const pendingRequest: TimeOffRequestRecord = {
  id: 'req-1', employeeId: 'emp-1', type: 'VACATION',
  startDate: new Date(daysFromNow(10)), endDate: new Date(daysFromNow(14)),
  totalDays: 5, reason: 'Holiday', status: 'PENDING',
  reviewedById: null, reviewNote: null, createdAt: new Date(), updatedAt: new Date(),
};

describe('TimeOffRequestsService', () => {
  let service: TimeOffRequestsService;
  let requestRepo: jest.Mocked<TimeOffRequestRepository>;
  let leaveBalanceSvc: jest.Mocked<LeaveBalanceService>;
  let employeesSvc: jest.Mocked<EmployeesService>;

  beforeEach(() => {
    requestRepo = { findAll: jest.fn(), findById: jest.fn(), findByEmployee: jest.fn(), findOverlapping: jest.fn(), create: jest.fn(), updateStatus: jest.fn(), cancel: jest.fn() } as any;
    leaveBalanceSvc = { hasEnoughBalance: jest.fn(), deductBalance: jest.fn(), restoreBalance: jest.fn(), getBalance: jest.fn(), initializeBalance: jest.fn() } as any;
    employeesSvc = { findOne: jest.fn(), findAll: jest.fn(), findReports: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() } as any;
    service = new TimeOffRequestsService(requestRepo, leaveBalanceSvc, employeesSvc);
  });

  describe('create', () => {
    const valid = { employeeId: 'emp-1', type: 'VACATION' as any, startDate: daysFromNow(10), endDate: daysFromNow(14) };

    it('creates request successfully', async () => {
      employeesSvc.findOne.mockResolvedValue(employee);
      requestRepo.findOverlapping.mockResolvedValue([]);
      leaveBalanceSvc.hasEnoughBalance.mockResolvedValue(true);
      requestRepo.create.mockResolvedValue(pendingRequest);
      expect((await service.create(valid)).status).toBe('PENDING');
    });

    it('throws if startDate after endDate', async () => {
      employeesSvc.findOne.mockResolvedValue(employee);
      await expect(service.create({ ...valid, startDate: daysFromNow(14), endDate: daysFromNow(10) }))
        .rejects.toThrow(/before or equal/);
    });

    it('throws if dates are in the past', async () => {
      employeesSvc.findOne.mockResolvedValue(employee);
      await expect(service.create({ ...valid, startDate: '2020-01-01', endDate: '2020-01-05' }))
        .rejects.toThrow(/past/);
    });

    it('throws if overlapping request exists', async () => {
      employeesSvc.findOne.mockResolvedValue(employee);
      requestRepo.findOverlapping.mockResolvedValue([pendingRequest]);
      await expect(service.create(valid)).rejects.toThrow(/overlap/);
    });

    it('throws if only weekend days requested', async () => {
      employeesSvc.findOne.mockResolvedValue(employee);
      requestRepo.findOverlapping.mockResolvedValue([]);
      // Find future date strings where new Date(string).getDay() gives weekend days,
      // accounting for UTC parsing shifting the day in non-UTC timezones.
      const fmt = (dt: Date) =>
        `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      const d = new Date();
      d.setDate(d.getDate() + 1);
      while (new Date(fmt(d)).getDay() !== 6) d.setDate(d.getDate() + 1);
      const sat = fmt(d);
      d.setDate(d.getDate() + 1);
      const sun = fmt(d);
      await expect(service.create({ ...valid, startDate: sat, endDate: sun }))
        .rejects.toThrow(/working day/);
    });

    it('throws if insufficient leave balance', async () => {
      employeesSvc.findOne.mockResolvedValue(employee);
      requestRepo.findOverlapping.mockResolvedValue([]);
      leaveBalanceSvc.hasEnoughBalance.mockResolvedValue(false);
      await expect(service.create(valid)).rejects.toThrow(/balance/);
    });
  });

  describe('review', () => {
    it('approves and deducts balance', async () => {
      requestRepo.findById.mockResolvedValue(pendingRequest);
      employeesSvc.findOne.mockResolvedValue(manager);
      leaveBalanceSvc.deductBalance.mockResolvedValue({} as any);
      requestRepo.updateStatus.mockResolvedValue({ ...pendingRequest, status: 'APPROVED' });
      const r = await service.review({ requestId: 'req-1', reviewedById: 'mgr-1', decision: 'APPROVE' });
      expect(r.status).toBe('APPROVED');
      expect(leaveBalanceSvc.deductBalance).toHaveBeenCalledWith('emp-1', 'VACATION', 5);
    });

    it('rejects without touching balance', async () => {
      requestRepo.findById.mockResolvedValue(pendingRequest);
      employeesSvc.findOne.mockResolvedValue(manager);
      requestRepo.updateStatus.mockResolvedValue({ ...pendingRequest, status: 'REJECTED' });
      await service.review({ requestId: 'req-1', reviewedById: 'mgr-1', decision: 'REJECT' });
      expect(leaveBalanceSvc.deductBalance).not.toHaveBeenCalled();
    });

    it('throws if employee reviews own request', async () => {
      requestRepo.findById.mockResolvedValue(pendingRequest);
      await expect(service.review({ requestId: 'req-1', reviewedById: 'emp-1', decision: 'APPROVE' }))
        .rejects.toThrow(/own/);
    });

    it('throws if reviewer is an EMPLOYEE', async () => {
      requestRepo.findById.mockResolvedValue(pendingRequest);
      employeesSvc.findOne.mockResolvedValue(employee);
      await expect(service.review({ requestId: 'req-1', reviewedById: 'mgr-1', decision: 'APPROVE' }))
        .rejects.toThrow(/manager/i);
    });

    it('throws if request is not PENDING', async () => {
      requestRepo.findById.mockResolvedValue({ ...pendingRequest, status: 'APPROVED' });
      await expect(service.review({ requestId: 'req-1', reviewedById: 'mgr-1', decision: 'APPROVE' }))
        .rejects.toThrow(/PENDING|Cannot review/);
    });

    it('throws for invalid decision value', async () => {
      requestRepo.findById.mockResolvedValue(pendingRequest);
      employeesSvc.findOne.mockResolvedValue(manager);
      await expect(service.review({ requestId: 'req-1', reviewedById: 'mgr-1', decision: 'MAYBE' }))
        .rejects.toThrow(/APPROVE|REJECT/);
    });
  });

  describe('cancel', () => {
    it('cancels a pending request', async () => {
      requestRepo.findById.mockResolvedValue(pendingRequest);
      requestRepo.cancel.mockResolvedValue({ ...pendingRequest, status: 'CANCELLED' });
      expect((await service.cancel('req-1', 'emp-1')).status).toBe('CANCELLED');
    });

    it('restores balance when cancelling approved request', async () => {
      requestRepo.findById.mockResolvedValue({ ...pendingRequest, status: 'APPROVED' });
      requestRepo.cancel.mockResolvedValue({ ...pendingRequest, status: 'CANCELLED' });
      leaveBalanceSvc.restoreBalance.mockResolvedValue({} as any);
      await service.cancel('req-1', 'emp-1');
      expect(leaveBalanceSvc.restoreBalance).toHaveBeenCalledWith('emp-1', 'VACATION', 5);
    });

    it('throws if cancelling someone else request', async () => {
      requestRepo.findById.mockResolvedValue(pendingRequest);
      await expect(service.cancel('req-1', 'emp-DIFFERENT')).rejects.toThrow(/own/);
    });

    it('throws if request already cancelled', async () => {
      requestRepo.findById.mockResolvedValue({ ...pendingRequest, status: 'CANCELLED' });
      await expect(service.cancel('req-1', 'emp-1')).rejects.toThrow(/already cancelled/);
    });
  });
});
