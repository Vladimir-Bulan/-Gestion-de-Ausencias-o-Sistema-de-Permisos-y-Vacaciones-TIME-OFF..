import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class LeaveBalance {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  employeeId: string;

  @Field(() => Int)
  vacationDays: number;

  @Field(() => Int)
  sickDays: number;

  @Field(() => Int)
  personalDays: number;

  @Field(() => Int)
  year: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
