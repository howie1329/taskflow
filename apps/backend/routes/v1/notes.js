import express from 'express';
import {
  createNote,
  fetchNoteById,
  fetchNotesByUserId,
  updateNote,
  deleteNote
} from '../../controllers/notes.js';
import { validate } from '../../middleware/validation.js';
import {
  createNoteSchema,
  updateNoteSchema,
  noteParamsSchema,
} from '../../validation/schemas.js';

const router = express.Router();

router.get('/user', fetchNotesByUserId);
router.get('/:noteId', validate(noteParamsSchema), fetchNoteById);
router.post('/create', validate(createNoteSchema), createNote);
router.patch('/:noteId', validate(updateNoteSchema), updateNote);
router.delete('/:noteId', validate(noteParamsSchema), deleteNote);

export default router;

