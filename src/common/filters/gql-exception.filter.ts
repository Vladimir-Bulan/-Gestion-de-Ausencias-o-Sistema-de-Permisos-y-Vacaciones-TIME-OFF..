import { Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    GqlArgumentsHost.create(host);

    if (exception instanceof HttpException) {
      const response = exception.getResponse() as any;
      const message =
        typeof response === 'string'
          ? response
          : response.message || exception.message;

      return new GraphQLError(
        Array.isArray(message) ? message.join(', ') : message,
        {
          extensions: {
            code: exception.constructor.name.replace('Exception', '').toUpperCase(),
            statusCode: exception.getStatus(),
          },
        },
      );
    }

    this.logger.error('Unhandled exception', exception);
    return new GraphQLError('Internal server error', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }
}
