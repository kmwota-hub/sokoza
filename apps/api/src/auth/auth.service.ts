import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RoleName } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) throw new ConflictException('Email already registered');

    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existingPhone) throw new ConflictException('Phone number already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const roleName = dto.role || RoleName.CUSTOMER;

    // Ensure role exists (seed if missing)
    let role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      role = await this.prisma.role.create({ data: { name: roleName } });
    }

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        userRoles: {
          create: { roleId: role.id },
        },
      },
      include: { userRoles: { include: { role: true } } },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.userRoles.map((ur) => ur.role.name),
    );

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (user.status === 'SUSPENDED')
      throw new UnauthorizedException('Account suspended. Contact support.');

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password');

    const roles = user.userRoles.map((ur) => ur.role.name);
    const tokens = await this.generateTokens(user.id, user.email, roles);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'sokoza_refresh_secret_dev',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { userRoles: { include: { role: true } } },
      });

      if (!user || user.status === 'SUSPENDED') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const roles = user.userRoles.map((ur) => ur.role.name);
      return this.generateTokens(user.id, user.email, roles);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  private async generateTokens(userId: string, email: string, roles: string[]) {
    const payload = { sub: userId, email, roles };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'sokoza_access_secret_dev',
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
      }),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: process.env.JWT_REFRESH_SECRET || 'sokoza_refresh_secret_dev',
          expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}