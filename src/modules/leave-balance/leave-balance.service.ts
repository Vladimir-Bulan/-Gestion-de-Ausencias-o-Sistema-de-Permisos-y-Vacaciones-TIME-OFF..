import { Injectable, NotFoundException } from 'src/common/nestjs-shim';
import { PrismaService } from '../../prisma/prisma.service';
import { LeaveBalanceRecord, LeaveType } from '../../common/types/domain.types';

const LEAVE_TYPE_FIELD_MAP: Partial<Record<LeaveType, string>> = {
  VACATION: 'vacationDays',
  SICK: 'sickDays',
  PERSONAL: 'personalDays',
};

@Injectable()
export class LeaveBalanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(employeeId: string): Promise<LeaveBalanceRecord> {
    const balance = await this.prisma.leaveBalance.findUnique({ where: { employeeId } });
    if (!balance) throw new NotFoundException(`Leave balance not found for employee "${employeeId}"`);
    return balance;
  }

  async hasEnoughBalance(employeeId: string, type: LeaveType, days: number): Promise<boolean> {
    if (type === 'UNPAID') return true;
    const balance = await this.getBalance(employeeId);
    const field = LEAVE_TYPE_FIELD_MAP[type];
    if (!field) return true;
    return (balance as any)[field] >= days;
  }

  async deductBalance(employeeId: string, type: LeaveType, days: number): Promise<LeaveBalanceRecord> {
    if (type === 'UNPAID') return this.getBalance(employeeId);
    const field = LEAVE_TYPE_FIELD_MAP[type];
    if (!field) return this.getBalance(employeeId);
    return this.prisma.leaveBalance.update({
      where: { employeeId },
      data: { [field]: { decrement: days } },
    });
  }

  async restoreBalance(employeeId: string, type: LeaveType, days: number): Promise<LeaveBalanceRecord> {
    if (type === 'UNPAID') return this.getBalance(employeeId);
    const field = LEAVE_TYPE_FIELD_MAP[type];
    if (!field) return this.getBalance(employeeId);
    return this.prisma.leaveBalance.update({
      where: { employeeId },
      data: { [field]: { increment: days } },
    });
  }

  async initializeBalance(employeeId: string): Promise<LeaveBalanceRecord> {
    return this.prisma.leaveBalance.create({
      data: { employeeId, vacationDays: 15, sickDays: 10, personalDays: 5, year: new Date().getFullYear() },
    });
  }
}
