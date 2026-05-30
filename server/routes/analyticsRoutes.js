import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import { getSubjectMastery, getActivityHeatmap } from "../controllers/analyticsController.js";


const router = express.Router();

// Protected analytics endpoints
router.use(checkAuth);

router.get("/subject-mastery", getSubjectMastery);
router.get("/activity-heatmap", getActivityHeatmap);

export default router;
