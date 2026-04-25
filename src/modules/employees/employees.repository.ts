import { Injectable, NotFoundException } from 'src/common/nestjs-shim';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeInput, UpdateEmployeeInput } from './dto/employee.input';
import { EmployeeRecord } from '../../common/types/domain.types';

@Injectable()
export class EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<EmployeeRecord[]> {
    return this.prisma.employee.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string): Promise<EmployeeRecord> {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException(`Employee with ID "${id}" not found`);
    return employee;
  }

  async findByEmail(email: string): Promise<EmployeeRecord | null> {
    return this.prisma.employee.findUnique({ where: { email } });
  }

  async findReports(managerId: string): Promise<EmployeeRecord[]> {
    return this.prisma.employee.findMany({ where: { managerId } });
  }

  async create(data: CreateEmployeeInput): Promise<EmployeeRecord> {
    return this.prisma.employee.create({ data });
  }

  async update(id: string, data: Partial<UpdateEmployeeInput>): Promise<EmployeeRecord> {
    await this.findById(id);
    return this.prisma.employee.update({ where: { id }, data });
  }

  async delete(id: string): Promise<EmployeeRecord> {
    await this.findById(id);
    return this.prisma.employee.delete({ where: { id } });
  }
}
