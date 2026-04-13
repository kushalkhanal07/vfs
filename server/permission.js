export const rolePermissions = {
  "Super Admin": ["*"],
  Admin: ["*"],
  Manager: ["read:all_files", "read:users", "change:status"],
  User: ["read:own_files", "write:own_files", "delete:own_files"],
};

export function normalizeRole(role) {
  if (role === "Admin") return "Super Admin";
  return role || "User";
}

export function isSuperAdmin(role) {
  return normalizeRole(role) === "Super Admin";
}

export function canManageUserStatus(actorRole, targetRole) {
  const normalizedActorRole = normalizeRole(actorRole);
  const normalizedTargetRole = normalizeRole(targetRole);

  if (normalizedActorRole === "Super Admin") {
    return true;
  }

  if (normalizedActorRole === "Manager") {
    return normalizedTargetRole !== "Super Admin";
  }

  return false;
}

export function canManageUsers(actorRole) {
  return ["Super Admin", "Manager"].includes(normalizeRole(actorRole));
}
