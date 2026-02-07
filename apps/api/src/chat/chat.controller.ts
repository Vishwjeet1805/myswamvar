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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { UserResponse } from '@matrimony/shared';
import type {
  ConversationSummary,
  MessageLimitResponse,
  MessageResponse,
} from '@matrimony/shared';
import { SendMessageDto } from '../dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'List conversations', description: 'List all conversations for the current user.' })
  @ApiResponse({ status: 200, description: 'List of conversation summaries.' })
  async listConversations(
    @Req() req: { user: UserResponse },
  ): Promise<ConversationSummary[]> {
    return this.chat.listConversations(req.user.id);
  }

  @Get('conversations/:userId/messages')
  @ApiOperation({ summary: 'Get messages', description: 'Get messages in a conversation with another user.' })
  @ApiParam({ name: 'userId', description: 'Other user ID' })
  @ApiQuery({ name: 'before', required: false, description: 'Cursor for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max messages (default 50, max 100)' })
  @ApiResponse({ status: 200, description: 'List of messages.' })
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
  @ApiOperation({ summary: 'Send message', description: 'Send a message to another user.' })
  @ApiParam({ name: 'userId', description: 'Other user ID' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 201, description: 'Sent message.' })
  async sendMessage(
    @Req() req: { user: UserResponse },
    @Param('userId') otherUserId: string,
    @Body() body: unknown,
  ): Promise<MessageResponse> {
    return this.chat.sendMessage(req.user.id, otherUserId, body);
  }

  @Get('message-limit')
  @ApiOperation({ summary: 'Message limit', description: 'Get daily message limit and usage (free tier).' })
  @ApiResponse({ status: 200, description: 'Sent today, daily limit, remaining.' })
  async getMessageLimit(
    @Req() req: { user: UserResponse },
  ): Promise<MessageLimitResponse> {
    return this.chat.getMessageLimit(req.user.id);
  }
}
