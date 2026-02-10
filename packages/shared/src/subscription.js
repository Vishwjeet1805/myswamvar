"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutBodySchema = exports.subscriptionFeaturesSchema = exports.subscriptionStatusSchema = exports.planIntervalSchema = void 0;
const zod_1 = require("zod");
exports.planIntervalSchema = zod_1.z.enum(['month', 'year']);
exports.subscriptionStatusSchema = zod_1.z.enum([
    'active',
    'trialing',
    'past_due',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'unpaid',
]);
exports.subscriptionFeaturesSchema = zod_1.z.object({
    unlimitedChat: zod_1.z.boolean(),
    contactAccess: zod_1.z.boolean(),
    advancedFilters: zod_1.z.boolean(),
}).strict();
exports.checkoutBodySchema = zod_1.z.object({
    planId: zod_1.z.string().uuid('Invalid plan id'),
    successUrl: zod_1.z.string().url().optional(),
    cancelUrl: zod_1.z.string().url().optional(),
}).strict();
//# sourceMappingURL=subscription.js.map