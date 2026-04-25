import { Injectable, BadRequestException, ForbiddenException } from 'src/common/nestjs-shim';
import { TimeOffRequestRecord, RequestStatus, LeaveType } from '../../common/types/domain.types';
import { TimeOffRequestRepository } from './time-off-requests.repository';
import { LeaveBalanceService } from '../leave-balance/leave-balance.service';
import { EmployeesService } from '../employees/employees.service';
import { CreateTimeOffRequestInput, ReviewRequestInput, FilterRequestsInput } from './dto/time-off-request.input';
import { calculateWorkingDays } from '../../common/utils/date.utils';

@Injectable()
export class TimeOffRequestsService {
  constructor(
    private readonly requestRepository: TimeOffRequestRepository,
    private readonly leaveBalanceService: LeaveBalanceService,
    private readonly employeesService: EmployeesService,
  ) {}

  async findAll(filters?: FilterRequestsInput): Promise<TimeOffRequestRecord[]> {
    const where: Record<string, any> = {};
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    return this.requestRepository.findAll(where);
  }

  async findOne(id: string): Promise<TimeOffRequestRecord> {
    return this.requestRepository.findById(id);
  }

  async findByEmployee(employeeId: string): Promise<TimeOffRequestRecord[]> {
    return this.requestRepository.findByEmployee(employeeId);
  }

  async create(input: CreateTimeOffRequestInput): Promise<TimeOffRequestRecord> {
    await this.employeesService.findOne(input.employeeId);

    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before or equal to end date');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      throw new BadRequestException('Cannot request time off for past dates');
    }

    const totalDays = calculateWorkingDays(startDate, endDate);
    if (totalDays === 0) {
      throw new BadRequestException('Request must include at least one working day');
    }

    const overlapping = await this.requestRepository.findOverlapping(input.employeeId, startDate, endDate);
    if (overlapping.length > 0) {
      throw new BadRequestException('You already have a pending or approved request overlapping these dates');
    }

    const hasBalance = await this.leaveBalanceService.hasEnoughBalance(input.employeeId, input.type as LeaveType, totalDays);
    if (!hasBalance) {
      throw new BadRequestException(`Insufficient ${input.type.toLowerCase()} leave balance. Requested ${totalDays} days.`);
    }

    return this.requestRepository.create({
      employee: { connect: { id: input.employeeId } },
      type: input.type,
      startDate,
      endDate,
      totalDays,
      reason: input.reason,
    });
  }

  async review(input: ReviewRequestInput): Promise<TimeOffRequestRecord> {
    const request = await this.requestRepository.findById(input.requestId);

    if (request.status !== 'PENDING') {
      throw new BadRequestException(`Cannot review a request with status "${request.status}"`);
    }

    if (request.employeeId === input.reviewedById) {
      throw new ForbiddenException('Employees cannot review their own requests');
    }

    const reviewer = await this.employeesService.findOne(input.reviewedById);
    if (reviewer.role === 'EMPLOYEE') {
      throw new ForbiddenException('Only managers or admins can review requests');
    }

    const decisionUpper = input.decision.toUpperCase();
    if (!['APPROVE', 'REJECT'].includes(decisionUpper)) {
      throw new BadRequestException('Decision must be either "APPROVE" or "REJECT"');
    }

    const isApproval = decisionUpper === 'APPROVE';
    const newStatus: RequestStatus = isApproval ? 'APPROVED' : 'REJECTED';

    if (isApproval) {
      await this.leaveBalanceService.deductBalance(request.employeeId, request.type as LeaveType, request.totalDays);
    }

    return this.requestRepository.updateStatus(input.requestId, newStatus, input.reviewedById, input.reviewNote);
  }

  async cancel(requestId: string, employeeId: string): Promise<TimeOffRequestRecord> {
    const request = await this.requestRepository.findById(requestId);

    if (request.employeeId !== employeeId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    if (request.status === 'CANCELLED') {
      throw new BadRequestException('Request is already cancelled');
    }

    if (request.status === 'APPROVED') {
      await this.leaveBalanceService.restoreBalance(request.employeeId, request.type as LeaveType, request.totalDays);
    }

    return this.requestRepository.cancel(requestId);
  }
}
