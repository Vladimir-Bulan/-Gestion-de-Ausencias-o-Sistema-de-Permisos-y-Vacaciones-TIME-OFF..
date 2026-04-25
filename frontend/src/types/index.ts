export type Role = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
export type LeaveType = 'VACATION' | 'SICK' | 'PERSONAL' | 'UNPAID';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  managerId?: string;
  createdAt: string;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employee?: Employee;
  type: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: RequestStatus;
  reviewedById?: string;
  reviewNote?: string;
  createdAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  vacationDays: number;
  sickDays: number;
  personalDays: number;
  year: number;
}
