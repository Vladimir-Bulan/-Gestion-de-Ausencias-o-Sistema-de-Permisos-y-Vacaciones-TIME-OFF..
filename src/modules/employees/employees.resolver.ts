import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeInput, UpdateEmployeeInput } from './dto/employee.input';

@Resolver(() => Employee)
export class EmployeesResolver {
  constructor(private readonly employeesService: EmployeesService) {}

  @Query(() => [Employee], { description: 'Get all employees' })
  employees(): Promise<Employee[]> {
    return this.employeesService.findAll() as any;
  }

  @Query(() => Employee, { description: 'Get a single employee by ID' })
  employee(@Args('id', { type: () => ID }) id: string): Promise<Employee> {
    return this.employeesService.findOne(id) as any;
  }

  @ResolveField(() => [Employee], { nullable: true, description: 'Direct reports of this employee' })
  reports(@Parent() employee: Employee): Promise<Employee[]> {
    return this.employeesService.findReports(employee.id) as any;
  }

  @Mutation(() => Employee, { description: 'Create a new employee' })
  createEmployee(@Args('input') input: CreateEmployeeInput): Promise<Employee> {
    return this.employeesService.create(input) as any;
  }

  @Mutation(() => Employee, { description: 'Update an existing employee' })
  updateEmployee(@Args('input') input: UpdateEmployeeInput): Promise<Employee> {
    return this.employeesService.update(input) as any;
  }

  @Mutation(() => Employee, { description: 'Delete an employee' })
  removeEmployee(@Args('id', { type: () => ID }) id: string): Promise<Employee> {
    return this.employeesService.remove(id) as any;
  }
}
