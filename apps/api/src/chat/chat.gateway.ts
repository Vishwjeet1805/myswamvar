import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '../auth/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';
import type { MessageResponse } from '@matrimony/shared';

interface AuthenticatedSocket {
  id: string;
  handshake: {
    auth?: { token?: string };
    query?: Record<string, string>;
  };
  data: { userId?: string };
  emit: (event: string, ...args: unknown[]) => void;
  disconnect: () => void;
}

/** Map userId -> Set of socket ids for presence / routing */
const userSockets = new Map<string, Set<string>>();

function registerSocket(userId: string, socketId: string): void {
  let set = userSockets.get(userId);
  if (!set) {
    set = new Set();
    userSockets.set(userId, set);
  }
  set.add(socketId);
}

function unregisterSocket(userId: string, socketId: string): void {
  const set = userSockets.get(userId);
  if (set) {
    set.delete(socketId);
    if (set.size === 0) userSockets.delete(userId);
  }
}

function getSocketIdsForUser(userId: string): string[] {
  return Array.from(userSockets.get(userId) ?? []);
}

@WebSocketGateway({
  cors: { origin: true },
  path: '/api/ws',
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly auth: AuthService,
    private readonly chat: ChatService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    const token =
      client.handshake.auth?.token ??
      (typeof client.handshake.query?.token === 'string'
        ? client.handshake.query.token
        : undefined);
    if (!token) {
      this.logger.warn('WebSocket connection without token');
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwt.verify<JwtPayload>(token);
      const user = await this.auth.validateUserById(payload.sub);
      if (!user) {
        client.disconnect();
        return;
      }
      (client as AuthenticatedSocket & { data: { userId: string } }).data.userId =
        user.id;
      registerSocket(user.id, client.id);
    } catch {
      this.logger.warn('WebSocket invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const userId = client.data?.userId;
    if (userId) unregisterSocket(userId, client.id);
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: AuthenticatedSocket,
    payload: { toUserId: string; content: string },
  ): Promise<{ ok: boolean; message?: MessageResponse; error?: string }> {
    const senderId = client.data?.userId;
    if (!senderId) {
      return { ok: false, error: 'Unauthorized' };
    }
    const { toUserId, content } = payload ?? {};
    if (!toUserId || typeof content !== 'string' || !content.trim()) {
      return { ok: false, error: 'Invalid payload: toUserId and content required' };
    }
    try {
      const message = await this.chat.sendMessage(senderId, toUserId, {
        content: content.trim(),
      });
      const receiverSockets = getSocketIdsForUser(toUserId);
      for (const sid of receiverSockets) {
        this.server.to(sid).emit('message', message);
      }
      return { ok: true, message };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send message';
      return { ok: false, error: msg };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    client: AuthenticatedSocket,
    payload: { toUserId: string },
  ): Promise<void> {
    const senderId = client.data?.userId;
    if (!senderId || !payload?.toUserId) return;
    const receiverSockets = getSocketIdsForUser(payload.toUserId);
    for (const sid of receiverSockets) {
      this.server.to(sid).emit('typing', { userId: senderId });
    }
  }
}
