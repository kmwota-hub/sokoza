import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let response: { status: jest.Mock; json: jest.Mock };

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('keeps client-safe messages for expected HTTP exceptions', () => {
    const host = {
      switchToHttp: () => ({ getResponse: () => response }),
    } as ArgumentsHost;

    filter.catch(new HttpException('Invalid input', 400), host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid input' }),
    );
  });

  it('logs unexpected errors without returning their internal details', () => {
    const host = {
      switchToHttp: () => ({ getResponse: () => response }),
    } as ArgumentsHost;
    const loggerError = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    try {
      filter.catch(new Error('Prisma datasource contains private connection details'), host);

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'An unexpected server error occurred',
          code: 'INTERNAL_SERVER_ERROR',
        }),
      );
      expect(response.json.mock.calls[0][0].message).not.toContain('Prisma datasource');
      expect(loggerError).toHaveBeenCalled();
    } finally {
      loggerError.mockRestore();
    }
  });
});
