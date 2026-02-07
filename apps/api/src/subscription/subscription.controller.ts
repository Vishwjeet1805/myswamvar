import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { UserResponse } from '@matrimony/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscription: SubscriptionService) {}

  @Get('plans')
  async getPlans() {
    return this.subscription.getPlans();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: { user: UserResponse }) {
    return this.subscription.getSubscriptionMe(req.user.id);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@Req() req: { user: UserResponse }, @Body() body: unknown) {
    return this.subscription.createCheckoutSession(req.user.id, body);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  async cancel(@Req() req: { user: UserResponse }) {
    return this.subscription.cancelSubscription(req.user.id);
  }

  @Post('webhook')
  async webhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature?: string,
  ) {
    return this.subscription.handleWebhook(req.rawBody ?? Buffer.from(''), signature);
  }
}
