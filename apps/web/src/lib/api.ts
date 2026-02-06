const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001';

export const apiBase = () => `${getBaseUrl()}/api`;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    phone: string | null;
    role: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? (JSON.parse(text) as T) : ({} as T);
  if (!res.ok) {
    const err = data as unknown as ApiError;
    const message = Array.isArray(err.message) ? err.message.join(' ') : err.message;
    throw new Error(message || res.statusText);
  }
  return data;
}

export async function register(body: {
  email: string;
  phone?: string;
  password: string;
}): Promise<AuthTokens> {
  const res = await fetch(`${apiBase()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseResponse<AuthTokens>(res);
}

export async function login(body: {
  email: string;
  password: string;
}): Promise<AuthTokens> {
  const res = await fetch(`${apiBase()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseResponse<AuthTokens>(res);
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  const res = await fetch(`${apiBase()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  return parseResponse<AuthTokens>(res);
}

export async function logout(accessToken: string, refreshToken?: string): Promise<{ message: string }> {
  const res = await fetch(`${apiBase()}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(refreshToken != null ? { refreshToken } : {}),
  });
  return parseResponse<{ message: string }>(res);
}
