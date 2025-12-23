import { noteService } from "../services/notes.js";

export const createNote = async (req, res) => {
  try {
    const userId = req.userId;
    const noteData = {
      ...req.body,
      userId: userId,
    };

    const note = await noteService.createNote(noteData);

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (error) {
    console.error("Create note error:", error);
    return res.status(500).json({ error: "Failed to create note" });
  }
};

export const fetchNoteById = async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await noteService.fetchNoteById(noteId);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Note fetched successfully",
      data: note,
    });
  } catch (error) {
    console.error("Fetch note error:", error);
    return res.status(500).json({ error: "Failed to fetch note" });
  }
};

export const fetchNotesByUserId = async (req, res) => {
  try {
    const userId = req.userId;
    const notes = await noteService.fetchNotesByUserId(userId);

    return res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
    });
  } catch (error) {
    console.error("Fetch notes error:", error);
    return res.status(500).json({ error: "Failed to fetch notes" });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const noteData = req.body;

    const note = await noteService.updateNote(noteId, noteData);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: note,
    });
  } catch (error) {
    console.error("Update note error:", error);
    return res.status(500).json({ error: "Failed to update note" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await noteService.deleteNote(noteId);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      data: note,
    });
  } catch (error) {
    console.error("Delete note error:", error);
    return res.status(500).json({ error: "Failed to delete note" });
  }
};
