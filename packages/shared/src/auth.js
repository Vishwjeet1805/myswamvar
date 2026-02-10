"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshBodySchema = exports.loginBodySchema = exports.registerBodySchema = void 0;
const zod_1 = require("zod");
const emailSchema = zod_1.z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email')
    .max(255);
const phoneSchema = zod_1.z
    .string()
    .max(20)
    .regex(/^\+?[0-9\s-]*$/, 'Invalid phone format')
    .optional()
    .or(zod_1.z.literal(''));
const passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(256);
exports.registerBodySchema = zod_1.z.object({
    email: emailSchema,
    phone: phoneSchema.transform((v) => (v === '' ? undefined : v)),
    password: passwordSchema,
});
exports.loginBodySchema = zod_1.z.object({
    email: emailSchema,
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.refreshBodySchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
//# sourceMappingURL=auth.js.map