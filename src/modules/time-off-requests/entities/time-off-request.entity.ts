import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Employee } from '../../employees/entities/employee.entity';

export enum LeaveType {
  VACATION = 'VACATION',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
  UNPAID = 'UNPAID',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(LeaveType, {
  name: 'LeaveType',
  description: 'Type of leave being requested',
});

registerEnumType(RequestStatus, {
  name: 'RequestStatus',
  description: 'Current status of a time off request',
});

@ObjectType()
export class TimeOffRequest {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  employeeId: string;

  @Field(() => Employee, { nullable: true })
  employee?: Employee;

  @Field(() => LeaveType)
  type: LeaveType;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field(() => Int)
  totalDays: number;

  @Field({ nullable: true })
  reason?: string;

  @Field(() => RequestStatus)
  status: RequestStatus;

  @Field(() => ID, { nullable: true })
  reviewedById?: string;

  @Field({ nullable: true })
  reviewNote?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
