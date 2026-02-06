import { z } from 'zod';

/** Max length for a single message (no PII in content; safe for audit) */
export const MESSAGE_CONTENT_MAX_LENGTH = 2000;

/** Free-tier daily message limit (enforced in API) */
export const FREE_DAILY_MESSAGE_LIMIT = 20;

export const sendMessageBodySchema = z.object({
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(MESSAGE_CONTENT_MAX_LENGTH, `Message must be at most ${MESSAGE_CONTENT_MAX_LENGTH} characters`),
}).strict();

export type SendMessageBody = z.infer<typeof sendMessageBodySchema>;

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  /** The other participant's user id (so client knows who they're chatting with) */
  otherUserId: string;
  /** Other participant's profile id (for linking to profile page) */
  otherUserProfileId?: string;
  /** Other participant's display name */
  otherUserDisplayName?: string;
  /** Last message preview if any */
  lastMessage?: MessageResponse | null;
  /** Unread count for current user (optional, can be added later) */
  unreadCount?: number;
}

export interface MessageLimitResponse {
  /** Messages sent today by this user (free tier) */
  sentToday: number;
  /** Daily limit for free users */
  dailyLimit: number;
  /** Whether user has unlimited messages (premium) */
  unlimited: boolean;
  /** Messages remaining today (0 when unlimited or at limit) */
  remainingToday: number;
}
