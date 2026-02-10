"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSavedSearchBodySchema = exports.createSavedSearchBodySchema = exports.savedSearchFiltersSchema = exports.InterestStatus = exports.sendInterestBodySchema = exports.addShortlistBodySchema = exports.searchProfilesQuerySchema = void 0;
const zod_1 = require("zod");
exports.searchProfilesQuerySchema = zod_1.z.object({
    ageMin: zod_1.z.coerce.number().int().min(18).max(100).optional(),
    ageMax: zod_1.z.coerce.number().int().min(18).max(100).optional(),
    gender: zod_1.z.enum(['male', 'female', 'other']).optional(),
    locationCountry: zod_1.z.string().max(100).optional(),
    locationState: zod_1.z.string().max(100).optional(),
    locationCity: zod_1.z.string().max(100).optional(),
    education: zod_1.z.string().max(200).optional(),
    occupation: zod_1.z.string().max(200).optional(),
    religion: zod_1.z.string().max(100).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
}).strict();
exports.addShortlistBodySchema = zod_1.z.object({
    profileId: zod_1.z.string().uuid(),
}).strict();
exports.sendInterestBodySchema = zod_1.z.object({
    profileId: zod_1.z.string().uuid(),
}).strict();
exports.InterestStatus = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
};
exports.savedSearchFiltersSchema = zod_1.z.object({
    ageMin: zod_1.z.number().int().min(18).max(100).optional(),
    ageMax: zod_1.z.number().int().min(18).max(100).optional(),
    gender: zod_1.z.enum(['male', 'female', 'other']).optional(),
    locationCountry: zod_1.z.string().max(100).optional(),
    locationState: zod_1.z.string().max(100).optional(),
    locationCity: zod_1.z.string().max(100).optional(),
    education: zod_1.z.string().max(200).optional(),
    occupation: zod_1.z.string().max(200).optional(),
    religion: zod_1.z.string().max(100).optional(),
}).strict();
exports.createSavedSearchBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    filters: exports.savedSearchFiltersSchema,
    notify: zod_1.z.boolean().default(false),
}).strict();
exports.updateSavedSearchBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    filters: exports.savedSearchFiltersSchema.optional(),
    notify: zod_1.z.boolean().optional(),
}).strict();
//# sourceMappingURL=search.js.map