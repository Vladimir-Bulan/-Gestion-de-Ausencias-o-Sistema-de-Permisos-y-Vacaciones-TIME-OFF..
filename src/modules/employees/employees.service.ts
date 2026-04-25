import { Injectable, ConflictException } from 'src/common/nestjs-shim';
import { EmployeeRecord } from '../../common/types/domain.types';
import { EmployeeRepository } from './employees.repository';
import { CreateEmployeeInput, UpdateEmployeeInput } from './dto/employee.input';

@Injectable()
export class EmployeesService {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async findAll(): Promise<EmployeeRecord[]> {
    return this.employeeRepository.findAll();
  }

  async findOne(id: string): Promise<EmployeeRecord> {
    return this.employeeRepository.findById(id);
  }

  async findReports(managerId: string): Promise<EmployeeRecord[]> {
    return this.employeeRepository.findReports(managerId);
  }

  async create(input: CreateEmployeeInput): Promise<EmployeeRecord> {
    const existing = await this.employeeRepository.findByEmail(input.email);
    if (existing) throw new ConflictException(`Employee with email "${input.email}" already exists`);

    if (input.managerId) await this.employeeRepository.findById(input.managerId);
    return this.employeeRepository.create(input);
  }

  async update(input: UpdateEmployeeInput): Promise<EmployeeRecord> {
    const { id, ...data } = input;
    if (data.email) {
      const existing = await this.employeeRepository.findByEmail(data.email);
      if (existing && existing.id !== id) throw new ConflictException(`Email "${data.email}" is already taken`);
    }
    if (data.managerId) await this.employeeRepository.findById(data.managerId);
    return this.employeeRepository.update(id, data);
  }

  async remove(id: string): Promise<EmployeeRecord> {
    return this.employeeRepository.delete(id);
  }
}
