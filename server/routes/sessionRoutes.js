import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import {
  createSession,
  getSession,
  getCurrentItem,
  rateItem,
  pauseSession,
  resumeSession,
  completeSession,
  getSessionHistory,
  startSession,
} from "../controllers/focusSessionController.js";

const router = express.Router();

// All session routes require authentication
router.use(checkAuth);

// Create a new session
router.post("/create", createSession);

// Get specific session details
router.get("/:id", getSession);

// Start session (move from setup to active)
router.patch("/:id/start", startSession);

// Get current item to study
router.get("/:id/current-item", getCurrentItem);

// Rate an item
router.post("/:id/rate-item", rateItem);

// Pause session
router.patch("/:id/pause", pauseSession);

// Resume session
router.patch("/:id/resume", resumeSession);

// Complete session
router.post("/:id/complete", completeSession);

// Get session history
router.get("/", getSessionHistory);

export default router;
