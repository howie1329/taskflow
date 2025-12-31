import express from "express";
import {
  createNote,
  fetchModels,
  generateSuggestedMessages,
} from "../../controllers/ai.js";
import { validate } from "../../middleware/validation.js";
import {
  createNoteFromAISchema,
  generateSuggestedMessagesSchema,
} from "../../validation/schemas.js";

const router = express.Router();

router.get("/models", fetchModels);
router.post("/create-note", validate(createNoteFromAISchema), createNote);
router.post("/suggested-messages", validate(generateSuggestedMessagesSchema), generateSuggestedMessages);

export default router;
