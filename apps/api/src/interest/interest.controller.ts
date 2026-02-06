import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { UserResponse } from '@matrimony/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InterestService } from './interest.service';

@Controller('interest')
@UseGuards(JwtAuthGuard)
export class InterestController {
  constructor(private readonly interest: InterestService) {}

  @Post()
  async send(
    @Req() req: { user: UserResponse },
    @Body() body: unknown,
  ) {
    return this.interest.send(req.user.id, body);
  }

  @Get('sent')
  async listSent(@Req() req: { user: UserResponse }) {
    return this.interest.listSent(req.user.id);
  }

  @Get('received')
  async listReceived(@Req() req: { user: UserResponse }) {
    return this.interest.listReceived(req.user.id);
  }

  @Post(':id/accept')
  async accept(
    @Req() req: { user: UserResponse },
    @Param('id') id: string,
  ) {
    return this.interest.accept(req.user.id, id);
  }

  @Post(':id/decline')
  async decline(
    @Req() req: { user: UserResponse },
    @Param('id') id: string,
  ) {
    return this.interest.decline(req.user.id, id);
  }
}
