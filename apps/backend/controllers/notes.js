import { noteService } from "../services/notes.js";
import { BaseOperationHandler } from "./base.js";

export const createNote = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const noteData = {
      ...req.body,
      userId: userId,
    };

    const note = await noteService.createNote(noteData);
    return note;
  });
};

export const fetchNoteById = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const { noteId } = req.params;
    const note = await noteService.fetchNoteById(noteId);

    if (!note) {
      const error = new Error("Note not found");
      error.statusCode = 404;
      throw error;
    }

    return note;
  });
};

export const fetchNotesByUserId = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const notes = await noteService.fetchNotesByUserId(userId);
    return notes;
  });
};

export const updateNote = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const { noteId } = req.params;
    const noteData = req.body;

    const note = await noteService.updateNote(noteId, noteData);

    if (!note) {
      const error = new Error("Note not found");
      error.statusCode = 404;
      throw error;
    }

    return note;
  });
};

export const deleteNote = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const { noteId } = req.params;
    const note = await noteService.deleteNote(noteId);

    if (!note) {
      const error = new Error("Note not found");
      error.statusCode = 404;
      throw error;
    }

    return note;
  });
};
