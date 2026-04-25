import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { LeaveType } from '../entities/time-off-request.entity';

@InputType()
export class CreateTimeOffRequestInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @Field(() => LeaveType)
  @IsEnum(LeaveType)
  type: LeaveType;

  @Field()
  @IsDateString()
  startDate: string;

  @Field()
  @IsDateString()
  endDate: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  reason?: string;
}

@InputType()
export class ReviewRequestInput {
  @Field(() => ID)
  @IsUUID()
  requestId: string;

  @Field(() => ID)
  @IsUUID()
  reviewedById: string;

  @Field()
  @IsNotEmpty()
  decision: string; // 'APPROVE' | 'REJECT'

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  reviewNote?: string;
}

@InputType()
export class FilterRequestsInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @Field(() => LeaveType, { nullable: true })
  @IsEnum(LeaveType)
  @IsOptional()
  type?: LeaveType;

  @Field({ nullable: true })
  @IsOptional()
  status?: string;
}
