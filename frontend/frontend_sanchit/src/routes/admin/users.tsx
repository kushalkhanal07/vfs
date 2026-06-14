import { createFileRoute } from "@tanstack/react-router";
import { AdminUsersPage } from "@/admin/pages/AdminUsersPage";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});
