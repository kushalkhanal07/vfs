import express from "express";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import {
  deleteFile,
  getFile,
  renameFile,
  uploadFile,
  restoreFile,
  permanentDeleteFile,
  toggleStarFile,
  shareFileWithUser,
  getFilesByType,
  getStarredItems,
} from "../controllers/fileController.js";

const router = express.Router();

router.param("parentDirId", validateIdMiddleware);
router.param("id", validateIdMiddleware);

router.post("/:parentDirId?", uploadFile);

router.get("/:id", getFile);

router.patch("/:id", renameFile);

router.delete("/:id", deleteFile);

router.put("/:id/restore", restoreFile);

router.delete("/:id/permanent", permanentDeleteFile);

router.put("/:id/star", toggleStarFile);

router.put("/:id/share", shareFileWithUser);

router.get("/type/:type", getFilesByType);

router.get("/starred/all", getStarredItems);

export default router;
