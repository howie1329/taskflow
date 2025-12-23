import express from "express";
import {
  createConversation,
  sendMessage,
} from "../../controllers/conversations.js";
import {
  deleteConversation,
  fetchConversation,
  fetchConversationMessagesById,
  fetchConversations,
} from "../../controllers/ai.js";
const router = express.Router();

router.post("/create", createConversation);
router.get("/", fetchConversations);
router.get("/:id", fetchConversation);
router.delete("/:id", deleteConversation);
router.get("/:id/messages", fetchConversationMessagesById);
router.post("/:id/messages", sendMessage);

export default router;
