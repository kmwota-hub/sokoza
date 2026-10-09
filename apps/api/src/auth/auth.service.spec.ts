import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let prisma: any;
  let jwtService: any;
  let passwordResetEmailService: any;
  let service: AuthService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-token'),
      verify: jest.fn(),
    };

    passwordResetEmailService = {
      assertConfigured: jest.fn(),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };
    process.env.APP_URL = 'https://sokoza.example';
    process.env.RESEND_API_KEY = 'test-resend-key';
    process.env.EMAIL_FROM = 'SOKOZA <test@example.com>';

    service = new AuthService(prisma, jwtService, passwordResetEmailService);
  });

  it('registers a user and issues signed tokens', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prisma.role.findUnique.mockResolvedValue({ id: 'role-1', name: RoleName.CUSTOMER });
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+254700000001',
      passwordHash: 'hashed-password',
      status: 'ACTIVE',
      userRoles: [{ role: { name: RoleName.CUSTOMER } }],
    });

    const result = await service.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+254700000001',
      password: 'StrongPass123!',
      role: RoleName.CUSTOMER,
    });

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'test@example.com',
          phone: '+254700000001',
          firstName: 'Test',
          lastName: 'User',
        }),
      }),
    );
    expect(result.user.email).toBe('test@example.com');
    expect(result.accessToken).toBe('signed-token');
    expect(result.refreshToken).toBe('signed-token');
  });

  it('rejects duplicate email registration', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

    await expect(
      service.register({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'duplicate@example.com',
        phone: '+254700000002',
        password: 'StrongPass123!',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('logs a user in with valid credentials and sanitizes the response', async () => {
    const passwordHash = await bcrypt.hash('StrongPass123!', 12);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '+254700000003',
      passwordHash,
      status: 'ACTIVE',
      userRoles: [{ role: { name: RoleName.CUSTOMER } }],
    });

    const result = await service.login({
      email: 'jane@example.com',
      password: 'StrongPass123!',
    });

    expect(result.user.email).toBe('jane@example.com');
    expect(result.user.passwordHash).toBeUndefined();
    expect(result.accessToken).toBe('signed-token');
  });

  it('rejects invalid login credentials', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'nope@example.com',
      passwordHash: await bcrypt.hash('CorrectPass123!', 12),
      status: 'ACTIVE',
      userRoles: [{ role: { name: RoleName.CUSTOMER } }],
    });

    await expect(
      service.login({
        email: 'nope@example.com',
        password: 'WrongPass123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('returns the same reset response for an unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await service.requestPasswordReset('unknown@example.com');

    expect(result.message).toBe('If an account exists for that email, a reset link will be sent.');
    expect(passwordResetEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('stores only a hashed token and emails the password reset link', async () => {
    const originalAppUrl = process.env.APP_URL;
    process.env.APP_URL = 'https://sokoza.example';
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'jane@example.com',
      firstName: 'Jane',
    });
    prisma.user.update.mockResolvedValue({});

    try {
      await service.requestPasswordReset(' jane@example.com ');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'jane@example.com' },
        select: { id: true, email: true, firstName: true },
      });
      const storedTokenHash = prisma.user.update.mock.calls[0][0].data.passwordResetTokenHash;
      expect(storedTokenHash).toMatch(/^[a-f0-9]{64}$/);
      expect(passwordResetEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'jane@example.com',
        'Jane',
        expect.stringMatching(/^https:\/\/sokoza\.example\/reset-password\?token=/),
      );
    } finally {
      if (originalAppUrl === undefined) {
        delete process.env.APP_URL;
      } else {
        process.env.APP_URL = originalAppUrl;
      }
    }
  });

  it('changes the password and consumes a valid reset token', async () => {
    const token = 'one-time-reset-token';
    const tokenHash = createHash('sha256').update(token).digest('hex');
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      passwordResetExpiresAt: new Date(Date.now() + 60_000),
    });
    prisma.user.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.resetPassword(token, 'NewStrongPass123!');

    expect(result.message).toBe('Password has been reset successfully');
    expect(prisma.user.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'user-1',
          passwordResetTokenHash: tokenHash,
        }),
        data: expect.objectContaining({
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
        }),
      }),
    );
  });

  it('rejects expired or invalid reset tokens', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.resetPassword('invalid-token', 'NewStrongPass123!'))
      .rejects.toThrow(BadRequestException);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });
});
