import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Same as JWT guard but does not throw when token is missing or invalid.
 * Use on routes that work for both authenticated and anonymous users.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: Error | null, user: TUser | false): TUser | undefined {
    if (err || !user) {
      return undefined;
    }
    return user;
  }
}
