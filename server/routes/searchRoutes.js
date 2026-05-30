import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import * as searchController from "../controllers/searchController.js";

const router = express.Router();

// Protected routes
router.use(checkAuth);

// Global search
router.get("/", searchController.globalSearch);

// Search notes
router.get("/notes", searchController.searchNotes);

// Search files
router.get("/files", searchController.searchFiles);

// Search folders
router.get("/folders", searchController.searchFolders);

// Get search suggestions
router.get("/suggestions", searchController.getSearchSuggestions);

// Get recent searches
router.get("/recent", searchController.getRecentSearches);

// Clear search history
router.delete("/history/clear", searchController.clearSearchHistory);

export default router;
