import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { UserResponse } from '@matrimony/shared';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

/** Rate limit: 5 attempts per 60 seconds for register/login */
const AUTH_LIMIT = { default: { ttl: 60000, limit: 5 } };

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Throttle(AUTH_LIMIT)
  async register(@Body() body: unknown) {
    return this.auth.register(body);
  }

  @Post('login')
  @Throttle(AUTH_LIMIT)
  async login(@Body() body: unknown) {
    return this.auth.login(body);
  }

  @Post('refresh')
  async refresh(@Body() body: unknown) {
    return this.auth.refresh(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: { user: UserResponse }) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: { user: UserResponse },
    @Body() body: { refreshToken?: string },
  ) {
    return this.auth.logout(req.user.id, body?.refreshToken);
  }
}
