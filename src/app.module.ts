import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { TimeOffRequestsModule } from './modules/time-off-requests/time-off-requests.module';
import { LeaveBalanceModule } from './modules/leave-balance/leave-balance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      formatError: (error) => ({
        message: error.message,
        code: error.extensions?.code,
        statusCode: error.extensions?.statusCode,
      }),
    }),
    PrismaModule,
    EmployeesModule,
    TimeOffRequestsModule,
    LeaveBalanceModule,
  ],
})
export class AppModule {}
