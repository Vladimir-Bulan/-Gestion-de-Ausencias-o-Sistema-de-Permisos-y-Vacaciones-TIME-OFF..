import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { LeaveBalanceService } from './leave-balance.service';
import { LeaveBalance } from './entities/leave-balance.entity';

@Resolver(() => LeaveBalance)
export class LeaveBalanceResolver {
  constructor(private readonly leaveBalanceService: LeaveBalanceService) {}

  @Query(() => LeaveBalance, { description: "Get an employee's leave balance" })
  leaveBalance(
    @Args('employeeId', { type: () => ID }) employeeId: string,
  ): Promise<LeaveBalance> {
    return this.leaveBalanceService.getBalance(employeeId) as any;
  }
}
