import { execSync } from 'child_process';
import * as path from 'path';
import { PrismaService } from '../database/prisma.service';

function getTestDatabaseUrl(): string {
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Set TEST_DATABASE_URL to a dedicated PostgreSQL database ending in _test.');
  }

  const databaseName = decodeURIComponent(new URL(databaseUrl).pathname.slice(1));
  if (!/_test$/i.test(databaseName)) {
    throw new Error('Refusing to reset a database whose name does not end in _test.');
  }

  return databaseUrl;
}

export async function resetTestDatabase(): Promise<PrismaService> {
  const testDatabaseUrl = getTestDatabaseUrl();
  const schemaPath = path.resolve(process.cwd(), '..', '..', 'prisma', 'schema.prisma');

  execSync(`npx prisma db push --accept-data-loss --force-reset --schema "${schemaPath}" --skip-generate`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
  });

  const prisma = new PrismaService({
    datasources: {
      db: {
        url: testDatabaseUrl,
      },
    },
  } as any);

  await prisma.$connect();
  return prisma;
}
