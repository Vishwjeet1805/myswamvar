import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { UserResponse } from '@matrimony/shared';
import { SendInterestDto } from '../dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InterestService } from './interest.service';

@ApiTags('interest')
@Controller('interest')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class InterestController {
  constructor(private readonly interest: InterestService) {}

  @Post()
  @ApiOperation({ summary: 'Send interest', description: 'Send interest to a profile.' })
  @ApiBody({ type: SendInterestDto })
  @ApiResponse({ status: 201, description: 'Interest sent.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async send(
    @Req() req: { user: UserResponse },
    @Body() body: unknown,
  ) {
    return this.interest.send(req.user.id, body);
  }

  @Get('sent')
  @ApiOperation({ summary: 'List sent', description: 'List interests sent by current user.' })
  @ApiResponse({ status: 200, description: 'List of sent interests.' })
  async listSent(@Req() req: { user: UserResponse }) {
    return this.interest.listSent(req.user.id);
  }

  @Get('received')
  @ApiOperation({ summary: 'List received', description: 'List interests received by current user.' })
  @ApiResponse({ status: 200, description: 'List of received interests.' })
  async listReceived(@Req() req: { user: UserResponse }) {
    return this.interest.listReceived(req.user.id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept interest', description: 'Accept an interest by ID.' })
  @ApiParam({ name: 'id', description: 'Interest ID' })
  @ApiResponse({ status: 200, description: 'Interest accepted.' })
  async accept(
    @Req() req: { user: UserResponse },
    @Param('id') id: string,
  ) {
    return this.interest.accept(req.user.id, id);
  }

  @Post(':id/decline')
  @ApiOperation({ summary: 'Decline interest', description: 'Decline an interest by ID.' })
  @ApiParam({ name: 'id', description: 'Interest ID' })
  @ApiResponse({ status: 200, description: 'Interest declined.' })
  async decline(
    @Req() req: { user: UserResponse },
    @Param('id') id: string,
  ) {
    return this.interest.decline(req.user.id, id);
  }
}
