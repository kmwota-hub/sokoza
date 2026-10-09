const REQUIRED_ENV_KEYS = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;

export function validateEnvironment(): void {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill in the missing values before starting the API.`,
    );
  }

  const databaseUrl = process.env.DATABASE_URL!.trim();
  let parsedDatabaseUrl: URL;

  try {
    parsedDatabaseUrl = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }

  if (
    !['postgres:', 'postgresql:'].includes(parsedDatabaseUrl.protocol) ||
    !parsedDatabaseUrl.hostname ||
    parsedDatabaseUrl.pathname.length <= 1
  ) {
    throw new Error(
      'DATABASE_URL must use postgres:// or postgresql:// and include a database name. Configure this value in the API host environment.',
    );
  }
}
