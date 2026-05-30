import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import * as dashboardController from "../controllers/dashboardController.js";

const router = express.Router();

// Protected routes
router.use(checkAuth);

// Get complete dashboard overview
router.get("/overview", dashboardController.getDashboardOverview);

// Get recent notes
router.get("/recent-notes", dashboardController.getRecentNotes);

// Get recent files
router.get("/recent-files", dashboardController.getRecentFiles);

// Get revision summary
router.get("/revision-summary", dashboardController.getRevisionSummary);

// Get activity summary
router.get("/activity", dashboardController.getActivitySummary);

// Get study streak
router.get("/streak", dashboardController.getStudyStreak);

// Get quick metrics for dashboard cards
router.get("/metrics", dashboardController.getDashboardMetrics);

// Get learning recommendations
router.get("/recommendations", dashboardController.getLearningRecommendations);

// Get all stats
router.get("/stats", dashboardController.getCompleteStats);

export default router;
