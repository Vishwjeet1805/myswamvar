const getRawBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001';

export const apiBase = () => {
  const base = getRawBaseUrl();
  return base.endsWith('/api') ? base : `${base}/api`;
};

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
  let data = {} as T;
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      const contentType = res.headers.get('content-type') ?? '';
      if (
        contentType.includes('text/html') ||
        text.startsWith('<!DOCTYPE') ||
        text.startsWith('<html')
      ) {
        throw new Error(
          `API returned HTML instead of JSON. Check NEXT_PUBLIC_API_URL (current base: ${getRawBaseUrl()}).`,
        );
      }
      throw new Error(`Invalid API response format (HTTP ${res.status}).`);
    }
  }
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

export interface SubscriptionFeatures {
  unlimitedChat: boolean;
  contactAccess: boolean;
  advancedFilters: boolean;
}

export interface Plan {
  id: string;
  name: string;
  interval: 'month' | 'year';
  priceCents: number;
  currency: string;
  features: SubscriptionFeatures;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  status:
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'unpaid';
  provider: 'stripe' | 'mock';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionMe {
  subscription: Subscription | null;
  isPremium: boolean;
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

export async function getProfileContact(
  profileId: string,
  accessToken: string,
): Promise<{ email?: string; phone?: string }> {
  const res = await fetch(`${apiBase()}/profiles/${profileId}/contact`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseResponse<{ email?: string; phone?: string }>(res);
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

// --- Subscription API ---

export async function getSubscriptionPlans(): Promise<Plan[]> {
  const res = await fetch(`${apiBase()}/subscription/plans`);
  return parseResponse<Plan[]>(res);
}

export async function getSubscriptionMe(accessToken: string): Promise<SubscriptionMe> {
  const res = await fetch(`${apiBase()}/subscription/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseResponse<SubscriptionMe>(res);
}

export async function createSubscriptionCheckout(
  accessToken: string,
  body: { planId: string; successUrl?: string; cancelUrl?: string },
): Promise<{ url: string; sessionId: string }> {
  const res = await fetch(`${apiBase()}/subscription/checkout`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });
  return parseResponse<{ url: string; sessionId: string }>(res);
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

export async function cancelSubscription(
  accessToken: string,
): Promise<Subscription> {
  const res = await fetch(`${apiBase()}/subscription/cancel`, {
    method: 'POST',
    headers: authHeaders(accessToken),
  });
  return parseResponse<Subscription>(res);
}

// --- Admin API (requires admin role) ---

export interface AdminUser {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profileId?: string;
  displayName?: string;
}

export interface AdminProfile {
  id: string;
  userId: string;
  displayName: string;
  gender: string;
  profileVerified: boolean;
  verifiedAt: string | null;
  verifiedBy: string | null;
  verificationNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubscription {
  id: string;
  status: string;
  provider: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userId: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalProfiles: number;
  activeSubscriptions: number;
  pendingUsers: number;
  signupsLast7Days: number;
  signupsLast30Days: number;
}

export async function adminGetUsers(
  accessToken: string,
  status?: 'pending' | 'approved' | 'rejected',
): Promise<AdminUser[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${apiBase()}/admin/users${q}`, {
    headers: authHeaders(accessToken),
  });
  return parseResponse<AdminUser[]>(res);
}

export async function adminApproveUser(
  accessToken: string,
  userId: string,
): Promise<AdminUser> {
  const res = await fetch(`${apiBase()}/admin/users/${userId}/approve`, {
    method: 'POST',
    headers: authHeaders(accessToken),
  });
  return parseResponse<AdminUser>(res);
}

export async function adminRejectUser(
  accessToken: string,
  userId: string,
): Promise<AdminUser> {
  const res = await fetch(`${apiBase()}/admin/users/${userId}/reject`, {
    method: 'POST',
    headers: authHeaders(accessToken),
  });
  return parseResponse<AdminUser>(res);
}

export async function adminGetProfiles(
  accessToken: string,
  verified?: boolean,
): Promise<AdminProfile[]> {
  const q =
    verified === true
      ? '?verified=true'
      : verified === false
        ? '?verified=false'
        : '';
  const res = await fetch(`${apiBase()}/admin/profiles${q}`, {
    headers: authHeaders(accessToken),
  });
  return parseResponse<AdminProfile[]>(res);
}

export async function adminVerifyProfile(
  accessToken: string,
  profileId: string,
  body: { verified: boolean; notes?: string },
): Promise<AdminProfile> {
  const res = await fetch(`${apiBase()}/admin/profiles/${profileId}/verify`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });
  return parseResponse<AdminProfile>(res);
}

export async function adminGetSubscriptions(
  accessToken: string,
): Promise<AdminSubscription[]> {
  const res = await fetch(`${apiBase()}/admin/subscriptions`, {
    headers: authHeaders(accessToken),
  });
  return parseResponse<AdminSubscription[]>(res);
}

export async function adminCancelSubscription(
  accessToken: string,
  subscriptionId: string,
): Promise<AdminSubscription> {
  const res = await fetch(
    `${apiBase()}/admin/subscriptions/${subscriptionId}/cancel`,
    {
      method: 'POST',
      headers: authHeaders(accessToken),
    },
  );
  return parseResponse<AdminSubscription>(res);
}

export async function adminGetAnalytics(
  accessToken: string,
): Promise<AdminAnalytics> {
  const res = await fetch(`${apiBase()}/admin/analytics`, {
    headers: authHeaders(accessToken),
  });
  return parseResponse<AdminAnalytics>(res);
}
