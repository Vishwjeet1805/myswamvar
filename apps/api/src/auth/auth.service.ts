import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { ROLES } from '@matrimony/shared';
import { randomUUID } from 'crypto';
import type {
  AuthTokensResponse,
  UserResponse,
} from '@matrimony/shared';
import {
  JWT_ACCESS_TTL_SEC,
  JWT_REFRESH_TTL_SEC,
  REFRESH_TOKEN_PREFIX,
  registerBodySchema,
  loginBodySchema,
  refreshBodySchema,
} from '@matrimony/shared';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const BCRYPT_ROUNDS = 12;

function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
  ) {}

  async register(body: unknown): Promise<AuthTokensResponse> {
    const parsed = registerBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw new BadRequestException(msg);
    }
    const { email, phone, password } = parsed.data;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email,
        phone: phone ?? null,
        passwordHash,
        role: 'user',
      },
    });

    return this.issueTokenPair(user);
  }

  async login(body: unknown): Promise<AuthTokensResponse> {
    const parsed = loginBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw new BadRequestException(msg);
    }
    const { email, password } = parsed.data;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Only approved users or admins can log in; rejected/pending cannot
    const isAdmin = user.role === ROLES.ADMIN;
    if (!isAdmin && user.status === 'rejected') {
      throw new UnauthorizedException('Account has been rejected. Contact support.');
    }
    if (!isAdmin && user.status === 'pending') {
      throw new UnauthorizedException('Account is pending approval.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.issueTokenPair(user);
  }

  async refresh(body: unknown): Promise<AuthTokensResponse> {
    const parsed = refreshBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException('Refresh token is required.');
    }
    const { refreshToken } = parsed.data;

    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!accessSecret || !refreshSecret) {
      throw new UnauthorizedException('Server configuration error.');
    }

    let payload: { sub: string; jti: string };
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: refreshSecret,
        maxAge: JWT_REFRESH_TTL_SEC,
      }) as { sub: string; jti: string };
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const redisKey = `${REFRESH_TOKEN_PREFIX}${payload.sub}:${payload.jti}`;
    const stored = await this.redis.get(redisKey);
    if (!stored) {
      throw new UnauthorizedException('Refresh token has been revoked or expired.');
    }

    await this.redis.del(redisKey);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }

    return this.issueTokenPair(user);
  }

  async logout(userId: string, refreshToken?: string): Promise<{ message: string }> {
    if (refreshToken) {
      const refreshSecret = process.env.JWT_REFRESH_SECRET;
      if (refreshSecret) {
        try {
          const payload = this.jwt.verify(refreshToken, {
            secret: refreshSecret,
            ignoreExpiration: true,
          }) as { sub: string; jti: string };
          const redisKey = `${REFRESH_TOKEN_PREFIX}${payload.sub}:${payload.jti}`;
          await this.redis.del(redisKey);
        } catch {
          // ignore invalid token on logout
        }
      }
    }
    return { message: 'Logged out successfully.' };
  }

  async validateUserById(userId: string): Promise<UserResponse | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return null;
    // Non-admin users must be approved to use the app
    const isAdmin = user.role === ROLES.ADMIN;
    if (!isAdmin && user.status !== 'approved') return null;
    return toUserResponse(user);
  }

  private async issueTokenPair(user: User): Promise<AuthTokensResponse> {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!accessSecret || !refreshSecret) {
      throw new UnauthorizedException('Server configuration error.');
    }

    const jti = randomUUID();
    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email },
      { secret: accessSecret, expiresIn: JWT_ACCESS_TTL_SEC },
    );
    const refreshToken = this.jwt.sign(
      { sub: user.id, jti },
      { secret: refreshSecret, expiresIn: JWT_REFRESH_TTL_SEC },
    );

    const redisKey = `${REFRESH_TOKEN_PREFIX}${user.id}:${jti}`;
    await this.redis.set(redisKey, '1', JWT_REFRESH_TTL_SEC);

    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_ACCESS_TTL_SEC,
      user: toUserResponse(user),
    };
  }
}
