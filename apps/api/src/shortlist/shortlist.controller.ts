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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { UserResponse } from '@matrimony/shared';
import { AddShortlistDto } from '../dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShortlistService } from './shortlist.service';

@ApiTags('shortlist')
@Controller('shortlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class ShortlistController {
  constructor(private readonly shortlist: ShortlistService) {}

  @Post()
  @ApiOperation({ summary: 'Add to shortlist', description: 'Add a profile to the shortlist.' })
  @ApiBody({ type: AddShortlistDto })
  @ApiResponse({ status: 201, description: 'Profile added to shortlist.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async add(
    @Req() req: { user: UserResponse },
    @Body() body: unknown,
  ) {
    return this.shortlist.add(req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'List shortlist', description: 'Get current user shortlist.' })
  @ApiResponse({ status: 200, description: 'List of shortlisted profiles.' })
  async list(@Req() req: { user: UserResponse }) {
    return this.shortlist.list(req.user.id);
  }

  @Delete(':profileId')
  @ApiOperation({ summary: 'Remove from shortlist', description: 'Remove a profile from the shortlist.' })
  @ApiParam({ name: 'profileId', description: 'Profile ID' })
  @ApiResponse({ status: 200, description: 'Profile removed.' })
  async remove(
    @Req() req: { user: UserResponse },
    @Param('profileId') profileId: string,
  ) {
    return this.shortlist.remove(req.user.id, profileId);
  }
}
