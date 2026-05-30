import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getCurrentUser,
  login,
  logout,
  logoutAll,
  register,
  getStorageInfo,
  createStorageCheckoutSession,
  confirmStorageCheckout,
  getUserProfile,
  updateUserProfile,
  getDashboardProfile,
} from "../controllers/userController.js";
import { requireRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/user/register", register);

router.post("/user/login", login);

router.get("/user", checkAuth, getCurrentUser);

// New profile endpoints
router.get("/user/me", checkAuth, getUserProfile);
router.get("/user/dashboard-profile", checkAuth, getDashboardProfile);

// Update profile
router.patch("/user/profile", checkAuth, updateUserProfile);

router.get(
  "/users",
  checkAuth,
  requireRoles("Super Admin", "Manager"),
  getAllUsers
);

router.post("/user/logout", logout);
router.post("/user/logout-all", logoutAll);

router.get("/user/storage", checkAuth, getStorageInfo);

router.post("/user/stripe/create-checkout-session", checkAuth, createStorageCheckoutSession);
router.post("/user/stripe/confirm-upgrade", checkAuth, confirmStorageCheckout);

export default router;
