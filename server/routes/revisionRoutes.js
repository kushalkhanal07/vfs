import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import * as revisionController from "../controllers/revisionController.js";
import * as revisionSessionController from "../controllers/revisionSessionController.js";

const router = express.Router();

// Protected routes
router.use(checkAuth);

// Add content to revision
router.post("/add", revisionController.addToRevision);

// Submit review
router.post("/review", revisionController.submitReview);

// Get today's revisions
router.get("/today", revisionController.getTodayRevisions);

// Get upcoming revisions
router.get("/upcoming", revisionController.getUpcomingRevisions);

// Get revision history
router.get("/history", revisionController.getRevisionHistory);

// Get revision stats
router.get("/stats", revisionController.getRevisionStats);

// Revision sessions CRUD
router.post("/session", revisionSessionController.createRevisionSession);
router.get("/session", revisionSessionController.getRevisionSessions);
router.get("/session/list", revisionSessionController.listRevisionSessions);
router.get("/session/:id", revisionSessionController.getRevisionSessionById);
router.put("/session/:id", revisionSessionController.updateRevisionSession);
router.delete("/session/:id", revisionSessionController.deleteRevisionSession);

// Backward-compatible session aliases
router.get("/sessions/week", revisionSessionController.getRevisionSessions);
router.post("/sessions", revisionSessionController.createRevisionSession);
router.put("/sessions/:id", revisionSessionController.updateRevisionSession);
router.delete("/sessions/:id", revisionSessionController.deleteRevisionSession);

// Remove from revision
router.delete("/:scheduleId", revisionController.removeFromRevision);

export default router;
