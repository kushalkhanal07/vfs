/**
 * Search Controller - Intelligent search with TF-IDF
 */

import Note from "../models/noteModel.js";
import File from "../models/fileModel.js";
import Directory from "../models/directoryModel.js";
import SearchHistory from "../models/searchHistoryModel.js";
import { SearchUtils } from "../utils/searchUtils.js";

// GLOBAL SEARCH
export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query required" });
    }

    const query = q.trim();

    // Search notes
    const notes = await Note.find({
      userId,
      deleted: false,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    })
      .select("_id title content tags createdAt")
      .limit(5)
      .lean();

    // Search files
    const files = await File.find({
      userId,
      deleted: false,
      name: { $regex: query, $options: "i" },
    })
      .select("_id name createdAt")
      .limit(5)
      .lean();

    // Search folders
    const folders = await Directory.find({
      userId,
      deleted: false,
      name: { $regex: query, $options: "i" },
    })
      .select("_id name")
      .limit(5)
      .lean();

    // Calculate scores using TF-IDF
    const documents = [
      ...notes.map((n) => ({
        ...n,
        type: "note",
        tokens: SearchUtils.tokenize(n.title + " " + n.content),
      })),
      ...files.map((f) => ({
        ...f,
        type: "file",
        tokens: SearchUtils.tokenize(f.name),
      })),
      ...folders.map((f) => ({
        ...f,
        type: "folder",
        tokens: SearchUtils.tokenize(f.name),
      })),
    ];

    const ranked = SearchUtils.calculateTFIDF(documents, query);
    const results = SearchUtils.rankResults(ranked).slice(0, 20);

    // Save search history
    await SearchHistory.create({
      userId,
      query,
      resultsCount: results.length,
    });

    res.json({ results, total: results.length });
  } catch (err) {
    next(err);
  }
};

// SEARCH NOTES
export const searchNotes = async (req, res, next) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query required" });
    }

    const query = q.trim();

    const notes = await Note.find({
      userId,
      deleted: false,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    })
      .select("_id title tags createdAt")
      .limit(50)
      .lean();

    const documents = notes.map((n) => ({
      ...n,
      tokens: SearchUtils.tokenize(n.title),
    }));

    const ranked = SearchUtils.calculateTFIDF(documents, query);
    const results = SearchUtils.rankResults(ranked);

    res.json({ results, count: results.length });
  } catch (err) {
    next(err);
  }
};

// SEARCH FILES
export const searchFiles = async (req, res, next) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query required" });
    }

    const files = await File.find({
      userId,
      deleted: false,
      name: { $regex: q, $options: "i" },
    })
      .select("_id name createdAt size")
      .limit(50)
      .lean();

    res.json({ results: files, count: files.length });
  } catch (err) {
    next(err);
  }
};

// SEARCH FOLDERS
export const searchFolders = async (req, res, next) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query required" });
    }

    const folders = await Directory.find({
      userId,
      deleted: false,
      name: { $regex: q, $options: "i" },
    })
      .select("_id name")
      .limit(50)
      .lean();

    res.json({ results: folders, count: folders.length });
  } catch (err) {
    next(err);
  }
};

// GET SEARCH SUGGESTIONS
export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const query = q.trim();

    // Get unique tags that match
    const tags = await Note.find({ userId, deleted: false, tags: { $regex: query, $options: "i" } })
      .distinct("tags")
      .limit(10);

    // Get recent note titles that match
    const titles = await Note.find({
      userId,
      deleted: false,
      title: { $regex: query, $options: "i" },
    })
      .select("title")
      .limit(5)
      .lean();

    const suggestions = [...tags, ...titles.map((t) => t.title)];

    res.json({ suggestions: Array.from(new Set(suggestions)) });
  } catch (err) {
    next(err);
  }
};

// GET RECENT SEARCHES
export const getRecentSearches = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const searches = await SearchHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("query")
      .lean();

    const uniqueQueries = [];
    const seen = new Set();

    for (const search of searches) {
      if (!seen.has(search.query)) {
        uniqueQueries.push(search.query);
        seen.add(search.query);
      }
    }

    res.json({ searches: uniqueQueries });
  } catch (err) {
    next(err);
  }
};

// CLEAR SEARCH HISTORY
export const clearSearchHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await SearchHistory.deleteMany({ userId });

    res.json({ message: "Search history cleared" });
  } catch (err) {
    next(err);
  }
};
