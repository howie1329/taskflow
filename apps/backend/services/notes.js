import { noteOps } from "../db/operations/notes.js";
import { createNotificationJob } from "./jobs.js";
import { embeddingService } from "./ai.js";
import { emitToRoom } from "../sockets/index.js";

export const noteService = {
  async createNote(noteData) {
    // Create embedding for note
    const embedding = await embeddingService.createEmbedding(
      noteData.title + " " + noteData.description
    );
    noteData.vector = embedding;

    const note = await noteOps.create(noteData);

    if (note) {
      await createNotificationJob({
        userId: noteData.userId,
        title: "Note Created",
        content: `Note ${noteData.title} has been created`,
      });

      if (note) {
        emitToRoom(noteData.userId, "note-created", {});
      }
    }

    return note;
  },

  async fetchNoteById(noteId) {
    return await noteOps.findById(noteId);
  },

  async fetchNotesByUserId(userId) {
    return await noteOps.findByUserId(userId);
  },

  async updateNote(noteId, noteData) {
    // Create embedding for updated note
    const embedding = await embeddingService.createEmbedding(
      noteData.title +
        " " +
        noteData.description +
        " " +
        (noteData.blocks || "")
    );
    noteData.vector = embedding;

    const note = await noteOps.update(noteId, noteData);

    if (note) {
      await createNotificationJob({
        userId: note.userId,
        title: "Note Updated",
        content: `Note ${note.title} has been updated`,
      });

      if (note) {
        emitToRoom(note.userId, "note-updated", { noteId: note.id });
      }
    }

    return note;
  },

  async deleteNote(noteId) {
    const note = await noteOps.delete(noteId);

    if (note) {
      await createNotificationJob({
        userId: note.userId,
        title: "Note Deleted",
        content: `Note ${note.title} has been deleted`,
      });

      if (note) {
        emitToRoom(note.userId, "note-deleted", {});
      }
    }

    return note;
  },
};
