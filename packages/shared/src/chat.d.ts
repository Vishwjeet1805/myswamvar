import { z } from 'zod';
export declare const MESSAGE_CONTENT_MAX_LENGTH = 2000;
export declare const FREE_DAILY_MESSAGE_LIMIT = 20;
export declare const sendMessageBodySchema: z.ZodObject<{
    content: z.ZodString;
}, "strict", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
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
    otherUserId: string;
    otherUserProfileId?: string;
    otherUserDisplayName?: string;
    lastMessage?: MessageResponse | null;
    unreadCount?: number;
}
export interface MessageLimitResponse {
    sentToday: number;
    dailyLimit: number;
    unlimited: boolean;
    remainingToday: number;
}
