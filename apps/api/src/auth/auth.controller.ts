import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { UserResponse } from '@matrimony/shared';
import { RegisterDto, LoginDto, RefreshDto, LogoutBodyDto } from '../dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

/** Rate limit: 5 attempts per 60 seconds for register/login */
const AUTH_LIMIT = { default: { ttl: 60000, limit: 5 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Throttle(AUTH_LIMIT)
  @ApiOperation({ summary: 'Register', description: 'Create a new user account. Rate limited.' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered; returns access and refresh tokens.' })
  @ApiResponse({ status: 400, description: 'Validation error (email, password, etc.).' })
  async register(@Body() body: unknown) {
    return this.auth.register(body);
  }

  @Post('login')
  @Throttle(AUTH_LIMIT)
  @ApiOperation({ summary: 'Login', description: 'Authenticate and receive tokens. Rate limited.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Returns access and refresh tokens.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() body: unknown) {
    return this.auth.login(body);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh tokens', description: 'Exchange refresh token for new access and refresh tokens.' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({ status: 200, description: 'New tokens returned.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
  async refresh(@Body() body: unknown) {
    return this.auth.refresh(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current user', description: 'Return the authenticated user (requires JWT).' })
  @ApiResponse({ status: 200, description: 'Current user.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async me(@Req() req: { user: UserResponse }) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Logout', description: 'Optionally invalidate refresh token. Requires JWT.' })
  @ApiBody({ type: LogoutBodyDto })
  @ApiResponse({ status: 200, description: 'Logged out.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout(
    @Req() req: { user: UserResponse },
    @Body() body: { refreshToken?: string },
  ) {
    return this.auth.logout(req.user.id, body?.refreshToken);
  }
}
