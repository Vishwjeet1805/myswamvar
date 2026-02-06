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

// --- Profile API ---

export interface ProfilePhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

export interface ProfilePreferences {
  minAge?: number;
  maxAge?: number;
  maritalStatus?: string;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  country?: string;
  state?: string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  dob: string;
  gender: string;
  location: { city?: string; state?: string; country?: string } | null;
  education: string | null;
  occupation: string | null;
  bio: string | null;
  preferences: ProfilePreferences | null;
  privacyContactVisibleTo: 'all' | 'premium' | 'none';
  profileVerified: boolean;
  photos: ProfilePhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfile {
  id: string;
  displayName: string;
  dob: string;
  gender: string;
  location: { city?: string; state?: string; country?: string } | null;
  education: string | null;
  occupation: string | null;
  bio: string | null;
  preferences: ProfilePreferences | null;
  profileVerified: boolean;
  emailVerified: boolean;
  photos: ProfilePhoto[];
  contact?: { email?: string; phone?: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileBody {
  displayName: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  location?: { city?: string; state?: string; country?: string };
  education?: string;
  occupation?: string;
  bio?: string;
  preferences?: ProfilePreferences;
  privacyContactVisibleTo?: 'all' | 'premium' | 'none';
}

export type UpdateProfileBody = Partial<CreateProfileBody>;

function authHeaders(accessToken: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getMyProfile(accessToken: string): Promise<Profile | null> {
  const res = await fetch(`${apiBase()}/profiles/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 200) {
    const data = await res.json();
    return data ?? null;
  }
  if (res.status === 401) throw new Error('Unauthorized');
  return parseResponse<Profile>(res);
}

export async function createProfile(
  accessToken: string,
  body: CreateProfileBody,
): Promise<Profile> {
  const res = await fetch(`${apiBase()}/profiles/me`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });
  return parseResponse<Profile>(res);
}

export async function updateProfile(
  accessToken: string,
  body: UpdateProfileBody,
): Promise<Profile> {
  const res = await fetch(`${apiBase()}/profiles/me`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });
  return parseResponse<Profile>(res);
}

export async function getProfileById(
  profileId: string,
  accessToken?: string,
): Promise<PublicProfile> {
  const headers: HeadersInit = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`${apiBase()}/profiles/${profileId}`, { headers });
  return parseResponse<PublicProfile>(res);
}

export async function addProfilePhoto(
  accessToken: string,
  file: File,
): Promise<ProfilePhoto> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${apiBase()}/profiles/me/photos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  return parseResponse<ProfilePhoto>(res);
}

export async function deleteProfilePhoto(
  accessToken: string,
  photoId: string,
): Promise<{ message: string }> {
  const res = await fetch(`${apiBase()}/profiles/me/photos/${photoId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseResponse<{ message: string }>(res);
}

export async function setPrimaryPhoto(
  accessToken: string,
  photoId: string,
): Promise<ProfilePhoto> {
  const res = await fetch(`${apiBase()}/profiles/me/photos/${photoId}/primary`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
  });
  return parseResponse<ProfilePhoto>(res);
}
