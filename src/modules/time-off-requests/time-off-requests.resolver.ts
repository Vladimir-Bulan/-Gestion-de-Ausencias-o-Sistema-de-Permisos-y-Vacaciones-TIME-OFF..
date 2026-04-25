import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { TimeOffRequestsService } from './time-off-requests.service';
import { TimeOffRequest } from './entities/time-off-request.entity';
import {
  CreateTimeOffRequestInput,
  ReviewRequestInput,
  FilterRequestsInput,
} from './dto/time-off-request.input';
import { EmployeesService } from '../employees/employees.service';
import { Employee } from '../employees/entities/employee.entity';

@Resolver(() => TimeOffRequest)
export class TimeOffRequestsResolver {
  constructor(
    private readonly timeOffRequestsService: TimeOffRequestsService,
    private readonly employeesService: EmployeesService,
  ) {}

  @Query(() => [TimeOffRequest], { description: 'Get all time off requests with optional filters' })
  timeOffRequests(
    @Args('filters', { nullable: true }) filters?: FilterRequestsInput,
  ): Promise<TimeOffRequest[]> {
    return this.timeOffRequestsService.findAll(filters) as any;
  }

  @Query(() => TimeOffRequest, { description: 'Get a single time off request by ID' })
  timeOffRequest(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TimeOffRequest> {
    return this.timeOffRequestsService.findOne(id) as any;
  }

  @Query(() => [TimeOffRequest], { description: 'Get all requests for a specific employee' })
  employeeTimeOffRequests(
    @Args('employeeId', { type: () => ID }) employeeId: string,
  ): Promise<TimeOffRequest[]> {
    return this.timeOffRequestsService.findByEmployee(employeeId) as any;
  }

  @ResolveField(() => Employee, { nullable: true })
  employee(@Parent() request: TimeOffRequest): Promise<Employee> {
    return this.employeesService.findOne(request.employeeId) as any;
  }

  @Mutation(() => TimeOffRequest, { description: 'Submit a new time off request' })
  createTimeOffRequest(
    @Args('input') input: CreateTimeOffRequestInput,
  ): Promise<TimeOffRequest> {
    return this.timeOffRequestsService.create(input) as any;
  }

  @Mutation(() => TimeOffRequest, { description: 'Approve or reject a time off request (managers only)' })
  reviewTimeOffRequest(
    @Args('input') input: ReviewRequestInput,
  ): Promise<TimeOffRequest> {
    return this.timeOffRequestsService.review(input) as any;
  }

  @Mutation(() => TimeOffRequest, { description: 'Cancel a time off request' })
  cancelTimeOffRequest(
    @Args('requestId', { type: () => ID }) requestId: string,
    @Args('employeeId', { type: () => ID }) employeeId: string,
  ): Promise<TimeOffRequest> {
    return this.timeOffRequestsService.cancel(requestId, employeeId) as any;
  }
}
