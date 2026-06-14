import { createFileRoute } from "@tanstack/react-router";
import { AdminFilesPage } from "@/admin/pages/AdminFilesPage";

export const Route = createFileRoute("/admin/files")({
  component: AdminFilesPage,
});
