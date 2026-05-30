/**
 * Notes Controller - Complete CRUD for notes
 */

import Note from "../models/noteModel.js";
import AnalyticsService from "../services/analyticsService.js";
import Directory from "../models/directoryModel.js";
import {
  computeNoteSpamScore,
  computeContentHash,
} from "../services/spamDetectionService.js";
import {
  computeCspaScore,
  mergeNoteDraftWithExisting,
} from "../services/cspaDetectionService.js";
import { scanNoteContent } from "../services/shieldDetectionService.js";

// CREATE NOTE
export const createNote = async (req, res, next) => {
  try {
    const {
      title,
      content = "",
      folderId = null,
      tags = [],
      overrideSpam = false,
      overrideDuplicate = false,
    } = req.body;
    const userId = req.user._id;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Validate folder ownership if provided
    if (folderId) {
      const folder = await Directory.findOne({ _id: folderId, userId });
      if (!folder) {
        return res.status(403).json({ error: "Folder not found or unauthorized" });
      }
    }

    // SPAM DETECTION
    const existingNotes = await Note.find({ userId, deleted: false })
      .select("content contentHash createdAt deleted")
      .lean();

    const spamResult = computeNoteSpamScore(content, existingNotes);
    const contentHash = spamResult.contentHash;
    const cspaResult = computeCspaScore(
      {
        title,
        content,
        tags,
        createdAt: new Date(),
      },
      existingNotes
    );
    const shieldResult = scanNoteContent({ title, content });

    if (shieldResult.action !== "SAFE") {
      return res.status(422).json({
        error: "MALICIOUS_NOTE",
        message: shieldResult.message,
        threatScore: shieldResult.threatScore,
        flags: shieldResult.flags,
        action: shieldResult.action,
        canOverride: false,
      });
    }

    // Check if spam and not overridden
    if (spamResult.isSpam && !overrideSpam) {
      return res.status(422).json({
        error: "SPAM_DETECTED",
        message: "This content appears to be duplicate or spam.",
        spamScore: spamResult.score,
        reasons: spamResult.penalties,
        canOverride: false, // Only admins can override
      });
    }

    if (cspaResult.isDuplicate && !overrideDuplicate) {
      return res.status(422).json({
        error: "DUPLICATE_NOTE",
        message: "This note looks like a duplicate. Want to merge it with the existing one?",
        similarityScore: cspaResult.score,
        similarityPercent: cspaResult.scorePercent,
        reasons: cspaResult.reasons,
        bestMatch: cspaResult.bestMatch,
        canOverride: true,
      });
    }

    const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length;

    const note = await Note.create({
      title: title.trim(),
      content,
      userId,
      folderId,
      tags: tags.filter((tag) => tag.trim().length > 0),
      wordCount,
      contentHash,
      spamScore: spamResult.score,
      isSpamFlagged: spamResult.isSpam,
      spamReasons: spamResult.penalties,
      cspaScore: cspaResult.score,
      isDuplicateFlagged: cspaResult.isDuplicate,
      isRelatedFlagged: cspaResult.isRelated,
      cspaReasons: cspaResult.reasons,
      shieldScore: shieldResult.threatScore,
      shieldAction: shieldResult.action,
      shieldFlags: shieldResult.flags,
    });

    // Log analytics activity
    try {
      await AnalyticsService.logActivity({
        userId,
        activityType: "note_create",
        activityCount: 1,
        duration: 0,
        subject: tags && tags[0] ? tags[0] : null,
      });
    } catch (e) {
      console.error("Failed to log analytics for note creation", e);
    }

    res.status(201).json({
      message: "Note created",
      note,
      cspaResult,
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL NOTES
export const getNotes = async (req, res, next) => {
  try {
    const { archived = false, favorite = false, pinned = false, folder } = req.query;
    const userId = req.user._id;

    const filter = { userId, deleted: false };

    if (archived === "true") filter.isArchived = true;
    else if (archived === "false") filter.isArchived = false;

    if (favorite === "true") filter.isFavorite = true;
    if (pinned === "true") filter.isPinned = true;

    if (folder) {
      filter.folderId = folder;
    }

    const notes = await Note.find(filter).sort({ lastEditedAt: -1 }).lean();

    res.json({ notes, count: notes.length });
  } catch (err) {
    next(err);
  }
};

// GET SINGLE NOTE
export const getNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findOne({ _id: id, userId, deleted: false });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ note });
  } catch (err) {
    next(err);
  }
};

// UPDATE NOTE
export const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, tags, folderId } = req.body;
    const userId = req.user._id;

    const note = await Note.findOne({ _id: id, userId });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Validate folder if changing
    if (folderId && folderId !== note.folderId.toString()) {
      const folder = await Directory.findOne({ _id: folderId, userId });
      if (!folder) {
        return res.status(403).json({ error: "Folder not found or unauthorized" });
      }
      note.folderId = folderId;
    }

    const nextTitle = title !== undefined ? title.trim() : note.title;
    const nextContent = content !== undefined ? content : note.content;
    const nextTags = tags ? tags.filter((tag) => tag.trim().length > 0) : note.tags;

    const shieldResult = scanNoteContent({ title: nextTitle, content: nextContent });
    if (shieldResult.action !== "SAFE") {
      return res.status(422).json({
        error: "MALICIOUS_NOTE",
        message: shieldResult.message,
        threatScore: shieldResult.threatScore,
        flags: shieldResult.flags,
        action: shieldResult.action,
      });
    }

    note.title = nextTitle;
    note.content = nextContent;
    note.tags = nextTags;

    // Update word count
    note.wordCount = String(nextContent).split(/\s+/).filter((word) => word.length > 0).length;
    note.lastEditedAt = new Date();

    await note.save();

    res.json({ message: "Note updated", note });
  } catch (err) {
    next(err);
  }
};

// DELETE NOTE (soft delete)
export const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findOneAndUpdate({ _id: id, userId }, { deleted: true }, { new: true });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted" });
  } catch (err) {
    next(err);
  }
};

// PIN NOTE
export const togglePin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findOne({ _id: id, userId });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.json({ message: "Pin status updated", isPinned: note.isPinned });
  } catch (err) {
    next(err);
  }
};

// ARCHIVE NOTE
export const toggleArchive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findOne({ _id: id, userId });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    note.isArchived = !note.isArchived;
    await note.save();

    res.json({ message: "Archive status updated", isArchived: note.isArchived });
  } catch (err) {
    next(err);
  }
};

// FAVORITE NOTE
export const toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findOne({ _id: id, userId });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    note.isFavorite = !note.isFavorite;
    await note.save();

    res.json({ message: "Favorite status updated", isFavorite: note.isFavorite });
  } catch (err) {
    next(err);
  }
};

// GET RECENT NOTES
export const getRecentNotes = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const notes = await Note.find({ userId, deleted: false, isArchived: false })
      .sort({ lastEditedAt: -1 })
      .limit(limit)
      .select("_id title tags lastEditedAt")
      .lean();

    res.json({ notes });
  } catch (err) {
    next(err);
  }
};

// GET NOTES BY DATE
export const getNotesByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const userId = req.user._id;

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const notes = await Note.find({
      userId,
      deleted: false,
      createdAt: { $gte: startDate, $lt: endDate },
    }).lean();

    res.json({ notes, count: notes.length });
  } catch (err) {
    next(err);
  }
};

// CHECK SPAM SCORE BEFORE CREATING NOTE
export const checkNoteSpam = async (req, res, next) => {
  try {
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Content is required" });
    }

    const existingNotes = await Note.find({ userId, deleted: false })
      .select("content contentHash createdAt deleted")
      .lean();

    const spamResult = computeNoteSpamScore(content, existingNotes);

    res.json({
      spamScore: spamResult.score,
      isSpam: spamResult.isSpam,
      isWarning: spamResult.isWarning,
      penalties: spamResult.penalties,
      message: spamResult.isSpam
        ? "This content appears to be duplicate or spam"
        : spamResult.isWarning
        ? "Similar content found in your notes"
        : "Content looks good",
    });
  } catch (err) {
    next(err);
  }
};

// CHECK NOTE CSPA SCORE BEFORE CREATING NOTE
export const checkNoteCspa = async (req, res, next) => {
  try {
    const { title = "", content = "", tags = [] } = req.body;
    const userId = req.user._id;

    const existingNotes = await Note.find({ userId, deleted: false })
      .select("title content tags createdAt deleted")
      .lean();

    const cspaResult = computeCspaScore(
      {
        title,
        content,
        tags,
        createdAt: new Date(),
      },
      existingNotes
    );

    res.json({
      similarityScore: cspaResult.score,
      similarityPercent: cspaResult.scorePercent,
      isDuplicate: cspaResult.isDuplicate,
      isRelated: cspaResult.isRelated,
      bestMatch: cspaResult.bestMatch,
      reasons: cspaResult.reasons,
      message: cspaResult.isDuplicate
        ? "You may have duplicate notes."
        : cspaResult.isRelated
        ? "This note looks related to an existing note."
        : "No strong match found.",
    });
  } catch (err) {
    next(err);
  }
};

// CHECK SHIELD SCORE BEFORE CREATING NOTE
export const checkNoteShield = async (req, res, next) => {
  try {
    const { title = "", content = "" } = req.body;

    const shieldResult = scanNoteContent({ title, content });

    res.json({
      threatScore: shieldResult.threatScore,
      flags: shieldResult.flags,
      action: shieldResult.action,
      message: shieldResult.message,
      isSafe: shieldResult.action === "SAFE",
    });
  } catch (err) {
    next(err);
  }
};

// MERGE DRAFT NOTE INTO EXISTING NOTE
export const mergeNote = async (req, res, next) => {
  try {
    const {
      targetNoteId,
      sourceNoteId = null,
      title = "",
      content = "",
      tags = [],
      folderId = null,
    } = req.body;
    const userId = req.user._id;

    if (!targetNoteId) {
      return res.status(400).json({ error: "targetNoteId is required" });
    }

    const targetNote = await Note.findOne({ _id: targetNoteId, userId, deleted: false });

    if (!targetNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    let sourceNote = null;

    if (sourceNoteId) {
      if (String(sourceNoteId) === String(targetNoteId)) {
        return res.status(400).json({ error: "sourceNoteId and targetNoteId must be different" });
      }

      sourceNote = await Note.findOne({ _id: sourceNoteId, userId, deleted: false }).lean();

      if (!sourceNote) {
        return res.status(404).json({ error: "Source note not found" });
      }
    }

    if (folderId) {
      const folder = await Directory.findOne({ _id: folderId, userId });
      if (!folder) {
        return res.status(403).json({ error: "Folder not found or unauthorized" });
      }
      targetNote.folderId = folderId;
    }

    const mergeSource = sourceNote || { title, content, tags };
    const merged = mergeNoteDraftWithExisting(targetNote, mergeSource);

    const mergedContent = merged.content || targetNote.content || "";
    const mergedTags = merged.tags.length > 0 ? merged.tags : targetNote.tags;
    const mergedTitle = merged.title || targetNote.title;

    const cspaResult = computeCspaScore(
      {
        title: mergedTitle,
        content: mergedContent,
        tags: mergedTags,
        createdAt: targetNote.createdAt,
      },
      await Note.find({ userId, deleted: false, _id: { $ne: targetNote._id } })
        .select("title content tags createdAt deleted")
        .lean()
    );

    const shieldResult = scanNoteContent({
      title: mergedTitle,
      content: mergedContent,
    });

    if (shieldResult.action !== "SAFE") {
      return res.status(422).json({
        error: "MALICIOUS_NOTE",
        message: shieldResult.message,
        threatScore: shieldResult.threatScore,
        flags: shieldResult.flags,
        action: shieldResult.action,
      });
    }

    targetNote.title = mergedTitle.trim();
    targetNote.content = mergedContent;
    targetNote.tags = mergedTags;
    targetNote.wordCount = mergedContent.split(/\s+/).filter((word) => word.length > 0).length;
    targetNote.contentHash = computeContentHash(mergedContent);
    targetNote.lastEditedAt = new Date();
    targetNote.cspaScore = cspaResult.score;
    targetNote.isDuplicateFlagged = cspaResult.isDuplicate;
    targetNote.isRelatedFlagged = cspaResult.isRelated;
    targetNote.cspaReasons = cspaResult.bestMatch?.breakdown?.map((item) => item.check) || [];
    targetNote.shieldScore = shieldResult.threatScore;
    targetNote.shieldAction = shieldResult.action;
    targetNote.shieldFlags = shieldResult.flags;

    await targetNote.save();

    if (sourceNoteId && sourceNote) {
      await Note.findOneAndUpdate(
        { _id: sourceNoteId, userId },
        { deleted: true, lastEditedAt: new Date() }
      );
    }

    res.json({
      message: "Notes merged",
      note: targetNote,
      cspaResult,
    });
  } catch (err) {
    next(err);
  }
};
