import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * `HttpException.getResponse()` normalmente já retorna um objeto
 * `{statusCode, message, error}` (as exceções built-in do Nest e o
 * ValidationPipe montam esse objeto sozinhas) - por isso não dá pra colocar
 * o retorno cru dentro de outro campo `message`, senão o corpo final vira
 * `message: { message: '...' }` e o cliente exibe "[object Object]".
 */
function extractMessage(response: string | object): string {
  if (typeof response === 'string') return response;
  const body = response as { message?: string | string[] };
  if (Array.isArray(body.message)) return body.message.join(' ');
  if (typeof body.message === 'string') return body.message;
  return 'Erro na requisição.';
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? extractMessage(exception.getResponse())
      : 'Erro interno do servidor';

    if (!isHttpException) {
      this.logger.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
