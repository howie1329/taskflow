import express from 'express';
import {
  createNote,
  fetchNoteById,
  fetchNotesByUserId,
  updateNote,
  deleteNote
} from '../../controllers/notes.js';

const router = express.Router();

router.get('/user', fetchNotesByUserId);
router.get('/:noteId', fetchNoteById);
router.post('/create', createNote);
router.patch('/:noteId', updateNote);
router.delete('/:noteId', deleteNote);

export default router;

