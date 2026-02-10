"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageBodySchema = exports.FREE_DAILY_MESSAGE_LIMIT = exports.MESSAGE_CONTENT_MAX_LENGTH = void 0;
const zod_1 = require("zod");
exports.MESSAGE_CONTENT_MAX_LENGTH = 2000;
exports.FREE_DAILY_MESSAGE_LIMIT = 20;
exports.sendMessageBodySchema = zod_1.z.object({
    content: zod_1.z
        .string()
        .min(1, 'Message content is required')
        .max(exports.MESSAGE_CONTENT_MAX_LENGTH, `Message must be at most ${exports.MESSAGE_CONTENT_MAX_LENGTH} characters`),
}).strict();
//# sourceMappingURL=chat.js.map