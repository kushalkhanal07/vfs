import { normalizeRole } from "../permission.js";

export default function requireAdmin(req, res, next) {
  const role = normalizeRole(req.user?.role);

  if (role !== "Super Admin") {
    return res.status(403).json({ error: "Admin access required." });
  }

  next();
}
