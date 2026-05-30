import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";

const router = express.Router();

router.use(checkAuth);

router.get("/", getSettings);
router.put("/", updateSettings);

export default router;
