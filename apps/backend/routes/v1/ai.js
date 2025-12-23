import express from "express";
import {
  createNote,
  fetchModels,
  generateSuggestedMessages,
} from "../../controllers/ai.js";

const router = express.Router();

router.get("/models", fetchModels);
router.post("/create-note", createNote);
router.post("/suggested-messages", generateSuggestedMessages);

export default router;
