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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { UserResponse } from '@matrimony/shared';
import { AdminVerifyProfileDto } from '../dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('JWT')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List users', description: 'List users with optional status filter. Admin only.' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected'] })
  @ApiResponse({ status: 200, description: 'List of users.' })
  async getUsers(
    @Query('status') status?: 'pending' | 'approved' | 'rejected',
    @Req() req?: { user: UserResponse },
  ) {
    return this.admin.getUsers(status);
  }

  @Post('users/:id/approve')
  @ApiOperation({ summary: 'Approve user', description: 'Approve a pending user. Admin only.' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User approved.' })
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
  @ApiOperation({ summary: 'Reject user', description: 'Reject a pending user. Admin only.' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User rejected.' })
  async rejectUser(
    @Param('id') userId: string,
    @Req() req: { user: UserResponse },
  ) {
    const result = await this.admin.rejectUser(userId, req.user.id);
    await this.admin.logAudit(req.user.id, 'user.reject', 'user', userId);
    return result;
  }

  @Get('profiles')
  @ApiOperation({ summary: 'List profiles', description: 'List profiles with optional verified filter. Admin only.' })
  @ApiQuery({ name: 'verified', required: false, type: String, description: 'true | false' })
  @ApiResponse({ status: 200, description: 'List of profiles.' })
  async getProfiles(
    @Query('verified') verified?: string,
  ) {
    const verifiedFilter =
      verified === 'true' ? true : verified === 'false' ? false : undefined;
    return this.admin.getProfiles(verifiedFilter);
  }

  @Patch('profiles/:id/verify')
  @ApiOperation({ summary: 'Verify profile', description: 'Set profile verification status. Admin only.' })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  @ApiBody({ type: AdminVerifyProfileDto })
  @ApiResponse({ status: 200, description: 'Profile verification updated.' })
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
  @ApiOperation({ summary: 'List subscriptions', description: 'List all subscriptions. Admin only.' })
  @ApiResponse({ status: 200, description: 'List of subscriptions.' })
  async getSubscriptions() {
    return this.admin.getSubscriptions();
  }

  @Post('subscriptions/:id/cancel')
  @ApiOperation({ summary: 'Cancel subscription (admin)', description: 'Cancel a subscription by ID. Admin only.' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled.' })
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
  @ApiOperation({ summary: 'Analytics', description: 'Get dashboard analytics. Admin only.' })
  @ApiResponse({ status: 200, description: 'Analytics summary.' })
  async getAnalytics() {
    return this.admin.getAnalytics();
  }
}
