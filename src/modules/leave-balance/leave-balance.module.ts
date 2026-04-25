import { Module } from '@nestjs/common';
import { LeaveBalanceService } from './leave-balance.service';
import { LeaveBalanceResolver } from './leave-balance.resolver';

@Module({
  providers: [LeaveBalanceService, LeaveBalanceResolver],
  exports: [LeaveBalanceService],
})
export class LeaveBalanceModule {}
