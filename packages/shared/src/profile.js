"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFILE_PHOTO_MAX_COUNT = exports.PROFILE_PHOTO_MAX_SIZE_BYTES = exports.PROFILE_PHOTO_MIME_TYPES = exports.updateProfileBodySchema = exports.createProfileBodySchema = exports.profilePreferencesSchema = exports.contactVisibilitySchema = exports.ContactVisibility = void 0;
const zod_1 = require("zod");
exports.ContactVisibility = {
    ALL: 'all',
    PREMIUM: 'premium',
    NONE: 'none',
};
exports.contactVisibilitySchema = zod_1.z.enum([
    exports.ContactVisibility.ALL,
    exports.ContactVisibility.PREMIUM,
    exports.ContactVisibility.NONE,
]);
exports.profilePreferencesSchema = zod_1.z.object({
    minAge: zod_1.z.number().int().min(18).max(100).optional(),
    maxAge: zod_1.z.number().int().min(18).max(100).optional(),
    maritalStatus: zod_1.z.string().max(50).optional(),
    religion: zod_1.z.string().max(100).optional(),
    caste: zod_1.z.string().max(100).optional(),
    motherTongue: zod_1.z.string().max(100).optional(),
    country: zod_1.z.string().max(100).optional(),
    state: zod_1.z.string().max(100).optional(),
}).strict();
exports.createProfileBodySchema = zod_1.z.object({
    displayName: zod_1.z.string().min(1, 'Display name is required').max(100),
    dob: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD'),
    gender: zod_1.z.enum(['male', 'female', 'other']),
    location: zod_1.z.object({
        city: zod_1.z.string().max(100).optional(),
        state: zod_1.z.string().max(100).optional(),
        country: zod_1.z.string().max(100).optional(),
    }).optional(),
    religion: zod_1.z.string().max(100).optional(),
    education: zod_1.z.string().max(200).optional(),
    occupation: zod_1.z.string().max(200).optional(),
    bio: zod_1.z.string().max(2000).optional(),
    preferences: exports.profilePreferencesSchema.optional(),
    privacyContactVisibleTo: exports.contactVisibilitySchema.optional(),
    timeOfBirth: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format').optional(),
    placeOfBirth: zod_1.z.string().max(200).optional(),
    birthLatLong: zod_1.z.object({
        lat: zod_1.z.number().min(-90).max(90),
        lng: zod_1.z.number().min(-180).max(180),
    }).optional(),
}).strict();
exports.updateProfileBodySchema = exports.createProfileBodySchema.partial();
exports.PROFILE_PHOTO_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];
exports.PROFILE_PHOTO_MAX_SIZE_BYTES = 5 * 1024 * 1024;
exports.PROFILE_PHOTO_MAX_COUNT = 10;
//# sourceMappingURL=profile.js.map