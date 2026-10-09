import { PrismaClient } from '@prisma/client';

const TEST_DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432/postgres?schema=public';

(async () => {
  const prisma = new PrismaClient({ datasources: { db: { url: TEST_DATABASE_URL } } });
  await prisma.$connect();
  await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE;');
  await prisma.$executeRawUnsafe('CREATE SCHEMA public;');
  console.log('reset ok');
  await prisma.$disconnect();
})();
