import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import * as notesController from "../controllers/notesController.js";

const router = express.Router();

// Protected routes
router.use(checkAuth);

// Create note
router.post("/", notesController.createNote);

// Get all notes with filters
router.get("/", notesController.getNotes);

// Get recent notes
router.get("/recent", notesController.getRecentNotes);

// Get notes by date
router.get("/date/:date", notesController.getNotesByDate);

// Get single note
router.get("/:id", notesController.getNote);

// Update note
router.put("/:id", notesController.updateNote);

// Delete note
router.delete("/:id", notesController.deleteNote);

// Pin/unpin note
router.patch("/:id/pin", notesController.togglePin);

// Archive/unarchive note
router.patch("/:id/archive", notesController.toggleArchive);

// Favorite/unfavorite note
router.patch("/:id/favorite", notesController.toggleFavorite);

// Check spam before creating note
router.post("/check-spam", notesController.checkNoteSpam);

// Check malicious content before creating note
router.post("/check-shield", notesController.checkNoteShield);

// Check duplicate / related notes before creating note
router.post("/check-cspa", notesController.checkNoteCspa);

// Merge a draft note into an existing note
router.post("/merge", notesController.mergeNote);

export default router;
