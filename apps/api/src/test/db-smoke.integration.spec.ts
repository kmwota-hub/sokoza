import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { RoleName } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { BusinessesService } from '../businesses/businesses.service';
import { resetTestDatabase } from './test-db';

const describeWithTestDatabase = process.env.TEST_DATABASE_URL ? describe : describe.skip;

describeWithTestDatabase('Postgres-backed auth and business smoke tests', () => {
  let prisma: PrismaService;
  let authService: AuthService;
  let businessesService: BusinessesService;

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'integration-access-secret';
    process.env.JWT_REFRESH_SECRET = 'integration-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';

    prisma = await resetTestDatabase();

    await prisma.role.createMany({
      data: Object.values(RoleName).map((name) => ({ name })),
      skipDuplicates: true,
    });

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_ACCESS_SECRET,
          signOptions: { expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN?.replace(/[^0-9]/g, '') || 15) },
        }),
      ],
      providers: [{ provide: PrismaService, useValue: prisma }, AuthService, BusinessesService],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    businessesService = moduleRef.get<BusinessesService>(BusinessesService);
  }, 30_000);

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  it('registers a customer, logs in, and refreshes tokens against the real database', async () => {
    const registration = await authService.register({
      firstName: 'Db',
      lastName: 'User',
      email: 'db-user@example.com',
      phone: '+254700000101',
      password: 'StrongPass123!',
    });

    expect(registration.user.email).toBe('db-user@example.com');
    expect(registration.accessToken).toBeTruthy();
    expect(registration.refreshToken).toBeTruthy();

    const login = await authService.login({
      email: 'db-user@example.com',
      password: 'StrongPass123!',
    });

    expect(login.user.id).toBe(registration.user.id);
    expect(login.accessToken).toBeTruthy();

    const refreshed = await authService.refreshToken(login.refreshToken);
    expect(refreshed.accessToken).toBeTruthy();
    expect(refreshed.refreshToken).toBeTruthy();
  });

  it('creates a business and a product using real database persistence', async () => {
    const owner = await authService.register({
      firstName: 'Business',
      lastName: 'Owner',
      email: 'business-owner@example.com',
      phone: '+254700000102',
      password: 'StrongPass123!',
    });

    const business = await businessesService.create(owner.user.id, {
      businessName: 'Fresh Basket',
      description: 'Fresh groceries and pantry essentials',
      phone: '+254700000103',
      email: 'hello@freshbasket.co.ke',
      address: 'Juja Road',
      area: 'Juja',
      latitude: -1.1026,
      longitude: 37.0132,
      deliveryMode: 'BOTH',
    } as any);

    expect(business.slug).toBe('fresh-basket');

    const category = await prisma.category.create({
      data: {
        name: 'Groceries',
        slug: 'groceries',
        description: 'Everyday grocery items',
        status: 'ACTIVE',
      },
    });

    const product = await prisma.product.create({
      data: {
        businessId: business.id,
        categoryId: category.id,
        name: 'Rice 5kg',
        slug: 'rice-5kg',
        description: 'Premium aromatic rice',
        price: 350,
        sku: 'RICE-5KG-001',
        status: 'ACTIVE',
        inventory: {
          create: {
            quantity: 24,
            lowStockThreshold: 5,
          },
        },
      },
      include: { inventory: true },
    });

    const products = await businessesService.getProducts(business.id);
    expect(products.some((item) => item.id === product.id)).toBe(true);
    expect(product.inventory?.quantity).toBe(24);
  });
});
