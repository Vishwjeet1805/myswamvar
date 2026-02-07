import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { UserResponse } from '@matrimony/shared';
import { CheckoutDto } from '../dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';

@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscription: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List plans', description: 'Get available subscription plans.' })
  @ApiResponse({ status: 200, description: 'List of plans.' })
  async getPlans() {
    return this.subscription.getPlans();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'My subscription', description: 'Get current user subscription and premium status.' })
  @ApiResponse({ status: 200, description: 'Subscription or null and isPremium flag.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMe(@Req() req: { user: UserResponse }) {
    return this.subscription.getSubscriptionMe(req.user.id);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create checkout', description: 'Create Stripe checkout session for a plan.' })
  @ApiBody({ type: CheckoutDto })
  @ApiResponse({ status: 200, description: 'Checkout URL and session ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async checkout(@Req() req: { user: UserResponse }, @Body() body: unknown) {
    return this.subscription.createCheckoutSession(req.user.id, body);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Cancel subscription', description: 'Cancel current user subscription at period end.' })
  @ApiResponse({ status: 200, description: 'Subscription set to cancel at period end.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async cancel(@Req() req: { user: UserResponse }) {
    return this.subscription.cancelSubscription(req.user.id);
  }

  @Post('webhook')
  @ApiExcludeEndpoint()
  async webhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature?: string,
  ) {
    return this.subscription.handleWebhook(req.rawBody ?? Buffer.from(''), signature);
  }
}
