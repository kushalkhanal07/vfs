import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import {
  cancelSession,
  completeSession,
  createSession,
  getSessionById,
  listSessions,
  startSession,
  updateSession,
} from "../services/session.service.js";

const router = express.Router();

router.use(checkAuth);

router.post("/", async (req, res, next) => {
  try {
    const session = await createSession(req.user._id, req.body);
    res.status(201).json({ message: "Session created", session });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const sessions = await listSessions(req.user._id);
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const session = await getSessionById(req.user._id, req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ session });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const session = await updateSession(req.user._id, req.params.id, req.body);
    res.json({ message: "Session updated", session });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/start", async (req, res, next) => {
  try {
    const session = await startSession(req.user._id, req.params.id);
    res.json({ message: "Session started", session });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/complete", async (req, res, next) => {
  try {
    const session = await completeSession(req.user._id, req.params.id);
    res.json({ message: "Session completed", session });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const session = await cancelSession(req.user._id, req.params.id);
    res.json({ message: "Session cancelled", session });
  } catch (error) {
    next(error);
  }
});

export default router;