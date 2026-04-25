import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesResolver } from './employees.resolver';
import { EmployeeRepository } from './employees.repository';

@Module({
  providers: [EmployeesResolver, EmployeesService, EmployeeRepository],
  exports: [EmployeesService],
})
export class EmployeesModule {}
