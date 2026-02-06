import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { UserResponse } from '@matrimony/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShortlistService } from './shortlist.service';

@Controller('shortlist')
@UseGuards(JwtAuthGuard)
export class ShortlistController {
  constructor(private readonly shortlist: ShortlistService) {}

  @Post()
  async add(
    @Req() req: { user: UserResponse },
    @Body() body: unknown,
  ) {
    return this.shortlist.add(req.user.id, body);
  }

  @Get()
  async list(@Req() req: { user: UserResponse }) {
    return this.shortlist.list(req.user.id);
  }

  @Delete(':profileId')
  async remove(
    @Req() req: { user: UserResponse },
    @Param('profileId') profileId: string,
  ) {
    return this.shortlist.remove(req.user.id, profileId);
  }
}
