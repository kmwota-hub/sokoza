import { BusinessesService } from './businesses.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('BusinessesService', () => {
  let prisma: any;
  let service: BusinessesService;

  beforeEach(() => {
    prisma = {
      business: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      businessMember: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
      },
    };

    service = new BusinessesService(prisma);
  });

  it('creates a business with a slugified name and owner id', async () => {
    prisma.business.findUnique.mockResolvedValue(null);
    prisma.business.create.mockResolvedValue({
      id: 'business-1',
      businessName: 'Fresh Groceries',
      slug: 'fresh-groceries',
      ownerId: 'owner-1',
    });

    const result = await service.create('owner-1', {
      businessName: 'Fresh Groceries',
      description: 'Local produce and pantry essentials',
      phone: '+254700000001',
      email: 'fresh@example.com',
      address: 'Juja Road',
      area: 'Juja',
      latitude: -1.1026,
      longitude: 37.0132,
      deliveryMode: 'BOTH',
    } as any);

    expect(prisma.business.findUnique).toHaveBeenCalledWith({
      where: { slug: 'fresh-groceries' },
    });
    expect(prisma.business.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          businessName: 'Fresh Groceries',
          slug: 'fresh-groceries',
          ownerId: 'owner-1',
        }),
      }),
    );
    expect(result.slug).toBe('fresh-groceries');
  });

  it('throws when trying to update a business the user does not own', async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: 'business-1',
      ownerId: 'owner-2',
    });

    await expect(
      service.update('business-1', 'owner-1', { businessName: 'Updated Store' } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('finds products for a valid business', async () => {
    prisma.business.findUnique.mockResolvedValue({ id: 'business-1' });
    prisma.product.findMany.mockResolvedValue([{ id: 'product-1', name: 'Rice 5kg' }]);

    const result = await service.getProducts('business-1');

    expect(prisma.business.findUnique).toHaveBeenCalledWith({
      where: { id: 'business-1' },
    });
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { businessId: 'business-1', status: 'ACTIVE' },
      include: { images: true, inventory: true, category: true },
    });
    expect(result).toHaveLength(1);
  });

  it('throws when getting products for a missing business', async () => {
    prisma.business.findUnique.mockResolvedValue(null);

    await expect(service.getProducts('missing-business')).rejects.toThrow(NotFoundException);
  });
});
