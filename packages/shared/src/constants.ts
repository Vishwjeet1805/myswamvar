export const FREE_USER_DAILY_MESSAGE_LIMIT = 10;

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

/** JWT access token TTL in seconds (e.g. 15 min) */
export const JWT_ACCESS_TTL_SEC = 900;

/** JWT refresh token TTL in seconds (e.g. 7 days) */
export const JWT_REFRESH_TTL_SEC = 604800;

/** Redis key prefix for refresh tokens (rotation / invalidation) */
export const REFRESH_TOKEN_PREFIX = 'refresh:';
