// Domain types - decoupled from Prisma generated client
// This follows the Dependency Inversion Principle (SOLID)

export type Role = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
export type LeaveType = 'VACATION' | 'SICK' | 'PERSONAL' | 'UNPAID';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  managerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeOffRequestRecord {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string | null;
  status: RequestStatus;
  reviewedById: string | null;
  reviewNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalanceRecord {
  id: string;
  employeeId: string;
  vacationDays: number;
  sickDays: number;
  personalDays: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}
