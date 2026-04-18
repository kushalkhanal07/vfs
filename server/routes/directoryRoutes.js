import express from "express";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";

import {
  createDirectory,
  deleteDirectory,
  getDirectory,
  renameDirectory,
  restoreDirectory,
  permanentDeleteDirectory,
  getTrash,
  toggleStarDirectory,
} from "../controllers/directoryController.js";

const router = express.Router();

router.param("parentDirId", validateIdMiddleware);
router.param("id", validateIdMiddleware);

router.get("/trash/all", getTrash);

router.get("/:id?", getDirectory);

router.post("/:parentDirId?", createDirectory);

router.patch("/:id", renameDirectory);

router.delete("/:id", deleteDirectory);

router.put("/:id/restore", restoreDirectory);

router.delete("/:id/permanent", permanentDeleteDirectory);

router.put("/:id/star", toggleStarDirectory);

export default router;
