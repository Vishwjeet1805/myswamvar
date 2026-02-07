import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { UserResponse } from '@matrimony/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  async getUsers(
    @Query('status') status?: 'pending' | 'approved' | 'rejected',
    @Req() req?: { user: UserResponse },
  ) {
    return this.admin.getUsers(status);
  }

  @Post('users/:id/approve')
  async approveUser(
    @Param('id') userId: string,
    @Req() req: { user: UserResponse },
  ) {
    const result = await this.admin.approveUser(userId, req.user.id);
    await this.admin.logAudit(req.user.id, 'user.approve', 'user', userId, {
      previousStatus: 'pending',
    });
    return result;
  }

  @Post('users/:id/reject')
  async rejectUser(
    @Param('id') userId: string,
    @Req() req: { user: UserResponse },
  ) {
    const result = await this.admin.rejectUser(userId, req.user.id);
    await this.admin.logAudit(req.user.id, 'user.reject', 'user', userId);
    return result;
  }

  @Get('profiles')
  async getProfiles(
    @Query('verified') verified?: string,
  ) {
    const verifiedFilter =
      verified === 'true' ? true : verified === 'false' ? false : undefined;
    return this.admin.getProfiles(verifiedFilter);
  }

  @Patch('profiles/:id/verify')
  async verifyProfile(
    @Param('id') profileId: string,
    @Body() body: unknown,
    @Req() req: { user: UserResponse },
  ) {
    const result = await this.admin.verifyProfile(profileId, req.user.id, body);
    await this.admin.logAudit(req.user.id, 'profile.verify', 'profile', profileId, {
      verified: result.profileVerified,
      notes: result.verificationNotes ?? undefined,
    });
    return result;
  }

  @Get('subscriptions')
  async getSubscriptions() {
    return this.admin.getSubscriptions();
  }

  @Post('subscriptions/:id/cancel')
  async cancelSubscription(
    @Param('id') subscriptionId: string,
    @Req() req: { user: UserResponse },
  ) {
    const result = await this.admin.cancelSubscriptionAdmin(
      subscriptionId,
      req.user.id,
    );
    await this.admin.logAudit(
      req.user.id,
      'subscription.cancel',
      'subscription',
      subscriptionId,
      { userId: result.userId },
    );
    return result;
  }

  @Get('analytics')
  async getAnalytics() {
    return this.admin.getAnalytics();
  }
}
