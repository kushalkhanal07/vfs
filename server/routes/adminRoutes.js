import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import requireAdmin from "../middlewares/adminMiddleware.js";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

router.use(checkAuth);
router.use(requireAdmin);

router.param("id", validateIdMiddleware);

router.get("/dashboard", adminController.getDashboard);

router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUser);
router.patch("/users/:id/status", adminController.updateUserStatus);
router.patch("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

router.get("/analytics/mastery", adminController.getLearningAnalytics);
router.get("/analytics/revisions", adminController.getRevisionAnalytics);
router.get("/analytics/productivity", adminController.getLearningAnalytics);

router.get("/revisions", adminController.getRevisionAnalytics);
router.get("/revisions/stats", adminController.getRevisionAnalytics);

router.get("/files", adminController.getFiles);
router.delete("/files/:id", adminController.deleteFile);
router.get("/storage", adminController.getStorageAnalytics);

router.get("/search-analytics", adminController.getSearchAnalytics);

router.get("/spam", adminController.getSpamAnalytics);
router.get("/spam/:id", adminController.getSpamIncident);
router.patch("/spam/:id", adminController.reviewSpamIncident);

router.get("/subjects", adminController.getSubjects);
router.post("/subjects", adminController.createSubject);
router.put("/subjects/:id", adminController.updateSubject);
router.delete("/subjects/:id", adminController.deleteSubject);

router.post("/notifications", adminController.createNotifications);
router.get("/notifications", adminController.getNotifications);

router.get("/feedback", adminController.getFeedback);
router.patch("/feedback/:id", adminController.updateFeedback);

router.get("/logs", adminController.getSystemLogs);

router.get("/settings", adminController.getAdminSettings);
router.put("/settings", adminController.updateAdminSettings);

export default router;
