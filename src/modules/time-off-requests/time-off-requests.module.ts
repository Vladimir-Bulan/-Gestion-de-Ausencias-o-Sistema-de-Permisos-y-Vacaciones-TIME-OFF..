import { Module } from '@nestjs/common';
import { TimeOffRequestsService } from './time-off-requests.service';
import { TimeOffRequestsResolver } from './time-off-requests.resolver';
import { TimeOffRequestRepository } from './time-off-requests.repository';
import { LeaveBalanceModule } from '../leave-balance/leave-balance.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [LeaveBalanceModule, EmployeesModule],
  providers: [TimeOffRequestsResolver, TimeOffRequestsService, TimeOffRequestRepository],
})
export class TimeOffRequestsModule {}
