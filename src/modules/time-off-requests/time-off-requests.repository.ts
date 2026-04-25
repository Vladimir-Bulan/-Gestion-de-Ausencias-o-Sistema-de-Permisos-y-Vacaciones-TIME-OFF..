import { Injectable, NotFoundException } from 'src/common/nestjs-shim';
import { PrismaService } from '../../prisma/prisma.service';
import { TimeOffRequestRecord, RequestStatus } from '../../common/types/domain.types';

@Injectable()
export class TimeOffRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: Record<string, any>): Promise<TimeOffRequestRecord[]> {
    return this.prisma.timeOffRequest.findMany({ where: filters, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string): Promise<TimeOffRequestRecord> {
    const request = await this.prisma.timeOffRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException(`Time off request with ID "${id}" not found`);
    return request;
  }

  async findByEmployee(employeeId: string): Promise<TimeOffRequestRecord[]> {
    return this.prisma.timeOffRequest.findMany({ where: { employeeId }, orderBy: { createdAt: 'desc' } });
  }

  async findOverlapping(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<TimeOffRequestRecord[]> {
    return this.prisma.timeOffRequest.findMany({
      where: {
        employeeId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { in: ['PENDING', 'APPROVED'] },
        AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }],
      },
    });
  }

  async create(data: Record<string, any>): Promise<TimeOffRequestRecord> {
    return this.prisma.timeOffRequest.create({ data });
  }

  async updateStatus(
    id: string,
    status: RequestStatus,
    reviewedById: string,
    reviewNote?: string,
  ): Promise<TimeOffRequestRecord> {
    return this.prisma.timeOffRequest.update({
      where: { id },
      data: { status, reviewedById, reviewNote },
    });
  }

  async cancel(id: string): Promise<TimeOffRequestRecord> {
    return this.prisma.timeOffRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
