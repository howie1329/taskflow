import express from "express";
import { sendMessage } from "../../controllers/conversations.js";
import {
  deleteConversation,
  fetchConversation,
  fetchConversationMessagesById,
  fetchConversations,
} from "../../controllers/ai.js";
import { validate } from "../../middleware/validation.js";
import {
  conversationIdParamsSchema,
  sendMessageSchema,
} from "../../validation/schemas.js";

const router = express.Router();

router.get("/", fetchConversations);
router.get("/:id", validate(conversationIdParamsSchema), fetchConversation);
router.delete("/:id", validate(conversationIdParamsSchema), deleteConversation);
router.get("/:id/messages", validate(conversationIdParamsSchema), fetchConversationMessagesById);
router.post("/:id/messages", validate(sendMessageSchema), sendMessage);

export default router;
