import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  const originalEnvironment = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnvironment,
      DATABASE_URL: 'postgresql://user:password@localhost:5432/sokoza_db?schema=public',
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
    };
  });

  afterAll(() => {
    process.env = originalEnvironment;
  });

  it('accepts a PostgreSQL URL with a database name', () => {
    expect(() => validateEnvironment()).not.toThrow();
  });

  it.each([
    'localhost:5432/sokoza_db',
    'mysql://user:password@localhost:3306/sokoza_db',
    'postgresql://localhost',
  ])('rejects an invalid database URL: %s', (databaseUrl) => {
    process.env.DATABASE_URL = databaseUrl;

    expect(() => validateEnvironment()).toThrow(/DATABASE_URL must/);
  });
});
