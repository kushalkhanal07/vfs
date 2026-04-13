import { normalizeRole } from "../permission.js";

export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    const currentRole = normalizeRole(req.user?.role);

    if (!allowedRoles.map(normalizeRole).includes(currentRole)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }

    next();
  };
}
