import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getCurrentUser,
  login,
  logout,
  logoutAll,
  register,
} from "../controllers/userController.js";
import { requireRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/user/register", register);

router.post("/user/login", login);

router.get("/user", checkAuth, getCurrentUser);

router.get(
  "/users",
  checkAuth,
  requireRoles("Super Admin", "Manager"),
  getAllUsers
);

router.post("/user/logout", logout);
router.post("/user/logout-all", logoutAll);

export default router;
