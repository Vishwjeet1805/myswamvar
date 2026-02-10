"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminVerifyProfileBodySchema = void 0;
const zod_1 = require("zod");
exports.adminVerifyProfileBodySchema = zod_1.z.object({
    verified: zod_1.z.boolean(),
    notes: zod_1.z.string().max(2000).optional(),
}).strict();
//# sourceMappingURL=admin.js.map