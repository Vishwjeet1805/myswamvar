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
  religion: string | null;
  location: { city?: string; state?: string; country?: string } | null;
  education: string | null;
  occupation: string | null;
  bio: string | null;
  preferences: ProfilePreferences | null;
  privacyContactVisibleTo: 'all' | 'premium' | 'none';
  profileVerified: boolean;
  timeOfBirth: string | null;
  placeOfBirth: string | null;
  birthLatLong: { lat: number; lng: number } | null;
  photos: ProfilePhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfile {
  id: string;
  displayName: string;
  dob: string;
  gender: string;
  religion: string | null;
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
  religion?: string;
  location?: { city?: string; state?: string; country?: string };
  education?: string;
  occupation?: string;
  bio?: string;
  preferences?: ProfilePreferences;
  privacyContactVisibleTo?: 'all' | 'premium' | 'none';
  timeOfBirth?: string;
  placeOfBirth?: string;
  birthLatLong?: { lat: number; lng: number };
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

// --- Search API ---

export interface SearchParams {
  ageMin?: number;
  ageMax?: number;
  gender?: 'male' | 'female' | 'other';
  locationCountry?: string;
  locationState?: string;
  locationCity?: string;
  education?: string;
  occupation?: string;
  religion?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  data: PublicProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function searchProfiles(
  params: SearchParams,
  accessToken?: string,
): Promise<SearchResult> {
  const sp = new URLSearchParams();
  if (params.ageMin != null) sp.set('ageMin', String(params.ageMin));
  if (params.ageMax != null) sp.set('ageMax', String(params.ageMax));
  if (params.gender) sp.set('gender', params.gender);
  if (params.locationCountry) sp.set('locationCountry', params.locationCountry);
  if (params.locationState) sp.set('locationState', params.locationState);
  if (params.locationCity) sp.set('locationCity', params.locationCity);
  if (params.education) sp.set('education', params.education);
  if (params.occupation) sp.set('occupation', params.occupation);
  if (params.religion) sp.set('religion', params.religion);
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const headers: HeadersInit = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`${apiBase()}/profiles/search?${sp.toString()}`, { headers });
  return parseResponse<SearchResult>(res);
}

// --- Shortlist API ---

export interface ShortlistItem {
  id: string;
  profileId: string;
  profile: PublicProfile;
  createdAt: string;
}

export async function getShortlist(accessToken: string): Promise<ShortlistItem[]> {
  const res = await fetch(`${apiBase()}/shortlist`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseResponse<ShortlistItem[]>(res);
}

export async function addToShortlist(
  accessToken: string,
  profileId: string,
): Promise<ShortlistItem> {
  const res = await fetch(`${apiBase()}/shortlist`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ profileId }),
  });
  return parseResponse<ShortlistItem>(res);
}

export async function removeFromShortlist(
  accessToken: string,
  profileId: string,
): Promise<{ message: string }> {
  const res = await fetch(`${apiBase()}/shortlist/${profileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseResponse<{ message: string }>(res);
}

// --- Interest API ---

export type InterestStatus = 'pending' | 'accepted' | 'declined';

export interface InterestItem {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromProfile?: PublicProfile;
  toProfile?: PublicProfile;
  status: InterestStatus;
  createdAt: string;
}

export async function sendInterest(
  accessToken: string,
  profileId: string,
): Promise<InterestItem> {
  const res = await fetch(`${apiBase()}/interest`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ profileId }),
  });
  return parseResponse<InterestItem>(res);
}

export async function getInterestsSent(accessToken: string): Promise<InterestItem[]> {
  const res = await fetch(`${apiBase()}/interest/sent`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseResponse<InterestItem[]>(res);
}

export async function getInterestsReceived(accessToken: string): Promise<InterestItem[]> {
  const res = await fetch(`${apiBase()}/interest/received`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseResponse<InterestItem[]>(res);
}

export async function acceptInterest(
  accessToken: string,
  interestId: string,
): Promise<InterestItem> {
  const res = await fetch(`${apiBase()}/interest/${interestId}/accept`, {
    method: 'POST',
    headers: authHeaders(accessToken),
  });
  return parseResponse<InterestItem>(res);
}

export async function declineInterest(
  accessToken: string,
  interestId: string,
): Promise<{ message: string }> {
  const res = await fetch(`${apiBase()}/interest/${interestId}/decline`, {
    method: 'POST',
    headers: authHeaders(accessToken),
  });
  return parseResponse<{ message: string }>(res);
}

// --- Saved searches API ---

export interface SavedSearchFilters {
  ageMin?: number;
  ageMax?: number;
  gender?: 'male' | 'female' | 'other';
  locationCountry?: string;
  locationState?: string;
  locationCity?: string;
  education?: string;
  occupation?: string;
  religion?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SavedSearchFilters;
  notify: boolean;
  createdAt: string;
}

export async function getSavedSearches(accessToken: string): Promise<SavedSearch[]> {
  const res = await fetch(`${apiBase()}/saved-searches`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseResponse<SavedSearch[]>(res);
}

export async function createSavedSearch(
  accessToken: string,
  body: { name: string; filters: SavedSearchFilters; notify?: boolean },
): Promise<SavedSearch> {
  const res = await fetch(`${apiBase()}/saved-searches`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });
  return parseResponse<SavedSearch>(res);
}

export async function deleteSavedSearch(
  accessToken: string,
  id: string,
): Promise<{ message: string }> {
  const res = await fetch(`${apiBase()}/saved-searches/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseResponse<{ message: string }>(res);
}

// --- Horoscope API ---

export interface HoroscopeMatch {
  matchPercent: number;
  doshaResult: {
    mangalDosha: boolean;
    nadiDosha: boolean;
    bhakootDosha: boolean;
    summary: string;
  };
}

export async function getHoroscopeMatch(
  accessToken: string,
  profileId: string,
): Promise<HoroscopeMatch> {
  const res = await fetch(`${apiBase()}/profiles/${profileId}/horoscope-match`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseResponse<HoroscopeMatch>(res);
}

// --- Chat API ---

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ChatConversationSummary {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  otherUserId: string;
  otherUserProfileId?: string;
  otherUserDisplayName?: string;
  lastMessage?: ChatMessage | null;
  unreadCount?: number;
}

export interface MessageLimit {
  sentToday: number;
  dailyLimit: number;
  unlimited: boolean;
  remainingToday: number;
}

export async function getChatConversations(
  accessToken: string,
): Promise<ChatConversationSummary[]> {
  const res = await fetch(`${apiBase()}/chat/conversations`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseResponse<ChatConversationSummary[]>(res);
}

export async function getChatMessages(
  accessToken: string,
  otherUserId: string,
  params?: { before?: string; limit?: number },
): Promise<ChatMessage[]> {
  const sp = new URLSearchParams();
  if (params?.before) sp.set('before', params.before);
  if (params?.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  const res = await fetch(
    `${apiBase()}/chat/conversations/${encodeURIComponent(otherUserId)}/messages${q ? `?${q}` : ''}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return parseResponse<ChatMessage[]>(res);
}

export async function sendChatMessage(
  accessToken: string,
  otherUserId: string,
  content: string,
): Promise<ChatMessage> {
  const res = await fetch(
    `${apiBase()}/chat/conversations/${encodeURIComponent(otherUserId)}/messages`,
    {
      method: 'POST',
      headers: authHeaders(accessToken),
      body: JSON.stringify({ content: content.trim() }),
    },
  );
  return parseResponse<ChatMessage>(res);
}

export async function getMessageLimit(
  accessToken: string,
): Promise<MessageLimit> {
  const res = await fetch(`${apiBase()}/chat/message-limit`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseResponse<MessageLimit>(res);
}
