import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { UserResponse } from '@matrimony/shared';
import type {
  ConversationSummary,
  MessageLimitResponse,
  MessageResponse,
} from '@matrimony/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('conversations')
  async listConversations(
    @Req() req: { user: UserResponse },
  ): Promise<ConversationSummary[]> {
    return this.chat.listConversations(req.user.id);
  }

  @Get('conversations/:userId/messages')
  async getMessages(
    @Req() req: { user: UserResponse },
    @Param('userId') otherUserId: string,
    @Query('before') before?: string,
    @Query('limit') limit?: string,
  ): Promise<MessageResponse[]> {
    const limitNum = limit != null ? Math.min(parseInt(limit, 10) || 50, 100) : 50;
    return this.chat.getMessages(req.user.id, otherUserId, before, limitNum);
  }

  @Post('conversations/:userId/messages')
  async sendMessage(
    @Req() req: { user: UserResponse },
    @Param('userId') otherUserId: string,
    @Body() body: unknown,
  ): Promise<MessageResponse> {
    return this.chat.sendMessage(req.user.id, otherUserId, body);
  }

  @Get('message-limit')
  async getMessageLimit(
    @Req() req: { user: UserResponse },
  ): Promise<MessageLimitResponse> {
    return this.chat.getMessageLimit(req.user.id);
  }
}
