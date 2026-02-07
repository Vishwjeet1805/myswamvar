import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import type {
  ConversationSummary,
  MessageLimitResponse,
  MessageResponse,
} from '@matrimony/shared';
import { sendMessageBodySchema, FREE_DAILY_MESSAGE_LIMIT } from '@matrimony/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly profile: ProfileService,
  ) {}

  /**
   * Mutual interest: there exists an accepted interest in either direction.
   */
  async hasMutualInterest(userId1: string, userId2: string): Promise<boolean> {
    if (userId1 === userId2) return false;
    const [a, b] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
    const acceptedFromA = await this.prisma.interest.findUnique({
      where: {
        fromUserId_toUserId: { fromUserId: a, toUserId: b },
        status: 'accepted',
      },
    });
    if (acceptedFromA) return true;
    const acceptedFromB = await this.prisma.interest.findUnique({
      where: {
        fromUserId_toUserId: { fromUserId: b, toUserId: a },
        status: 'accepted',
      },
    });
    return !!acceptedFromB;
  }

  /** Normalize pair so user1Id < user2Id for consistent conversation lookup. */
  private normalizePair(userId1: string, userId2: string): [string, string] {
    return userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
  }

  async getOrCreateConversation(userId1: string, userId2: string) {
    if (userId1 === userId2) {
      throw new BadRequestException('Cannot chat with yourself');
    }
    const hasMutual = await this.hasMutualInterest(userId1, userId2);
    if (!hasMutual) {
      throw new ForbiddenException(
        'Chat is available only when both users have mutual interest',
      );
    }
    const [u1, u2] = this.normalizePair(userId1, userId2);
    let conv = await this.prisma.conversation.findUnique({
      where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
    });
    if (!conv) {
      conv = await this.prisma.conversation.create({
        data: { user1Id: u1, user2Id: u2 },
      });
    }
    return conv;
  }

  async listConversations(userId: string): Promise<ConversationSummary[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      include: {
        user1: { include: { profile: { select: { id: true, displayName: true } } } },
        user2: { include: { profile: { select: { id: true, displayName: true } } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result: ConversationSummary[] = [];
    for (const c of conversations) {
      const otherUser = c.user1Id === userId ? c.user2 : c.user1;
      const otherUserId = otherUser.id;
      const lastMsg = c.messages[0];
      result.push({
        id: c.id,
        user1Id: c.user1Id,
        user2Id: c.user2Id,
        createdAt: c.createdAt.toISOString(),
        otherUserId,
        otherUserProfileId: otherUser.profile?.id,
        otherUserDisplayName: otherUser.profile?.displayName,
        lastMessage: lastMsg
          ? this.toMessageResponse(lastMsg, c.id)
          : null,
      });
    }
    return result;
  }

  private toMessageResponse(
    msg: { id: string; conversationId: string; senderId: string; content: string; createdAt: Date },
    conversationId: string,
  ): MessageResponse {
    return {
      id: msg.id,
      conversationId: msg.conversationId ?? conversationId,
      senderId: msg.senderId,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
    };
  }

  async getMessages(
    userId: string,
    otherUserId: string,
    before?: string,
    limit = 50,
  ): Promise<MessageResponse[]> {
    const conv = await this.getOrCreateConversation(userId, otherUserId);
    const beforeDate = before ? new Date(before) : undefined;
    const messages = await this.prisma.message.findMany({
      where: {
        conversationId: conv.id,
        ...(beforeDate ? { createdAt: { lt: beforeDate } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      include: { conversation: { select: { id: true } } },
    });
    return messages.reverse().map((m) => this.toMessageResponse(m, conv.id));
  }

  async sendMessage(
    senderId: string,
    receiverId: string,
    body: unknown,
  ): Promise<MessageResponse> {
    const parsed = sendMessageBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw new BadRequestException(msg);
    }
    const { content } = parsed.data;

    const conv = await this.getOrCreateConversation(senderId, receiverId);

    const isPremium = this.profile.isPremiumUser(senderId);
    if (!isPremium) {
      const { remainingToday } = await this.getMessageLimit(senderId);
      if (remainingToday <= 0) {
        throw new ForbiddenException(
          `Daily message limit (${FREE_DAILY_MESSAGE_LIMIT}) reached. Upgrade to premium for unlimited messages.`,
        );
      }
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId,
        content: content.trim(),
      },
    });
    return this.toMessageResponse(message, conv.id);
  }

  /** Count messages sent by user today (UTC). */
  async countMessagesSentToday(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    return this.prisma.message.count({
      where: { senderId: userId, createdAt: { gte: startOfDay } },
    });
  }

  async getMessageLimit(userId: string): Promise<MessageLimitResponse> {
    const isPremium = await this.profile.isPremiumUser(userId);
    const sentToday = isPremium ? 0 : await this.countMessagesSentToday(userId);
    const dailyLimit = FREE_DAILY_MESSAGE_LIMIT;
    const remainingToday = isPremium
      ? Number.MAX_SAFE_INTEGER
      : Math.max(0, dailyLimit - sentToday);
    return {
      sentToday,
      dailyLimit,
      unlimited: isPremium,
      remainingToday: isPremium ? Number.MAX_SAFE_INTEGER : remainingToday,
    };
  }

  /** Resolve other user's id to conversation id for current user. */
  async getConversationWith(userId: string, otherUserId: string) {
    const conv = await this.getOrCreateConversation(userId, otherUserId);
    return conv;
  }
}
