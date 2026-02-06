import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserResponse } from '@matrimony/shared';
import { ROLES } from '@matrimony/shared';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserResponse | undefined;
    if (!user) {
      throw new ForbiddenException('Authentication required.');
    }
    if (user.role !== ROLES.ADMIN) {
      throw new ForbiddenException('Admin access required.');
    }
    return true;
  }
}
