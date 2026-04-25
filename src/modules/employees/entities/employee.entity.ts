import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

registerEnumType(Role, {
  name: 'Role',
  description: 'Employee role within the organization',
});

@ObjectType()
export class Employee {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Role)
  role: Role;

  @Field(() => ID, { nullable: true })
  managerId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
