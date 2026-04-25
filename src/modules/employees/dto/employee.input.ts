import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsUUID, MinLength } from 'class-validator';
import { Role } from '../entities/employee.entity';

@InputType()
export class CreateEmployeeInput {
  @Field()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field(() => Role, { defaultValue: Role.EMPLOYEE })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  managerId?: string;
}

@InputType()
export class UpdateEmployeeInput extends PartialType(CreateEmployeeInput) {
  @Field(() => String)
  @IsUUID()
  id: string;
}
