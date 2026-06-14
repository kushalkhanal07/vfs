import { createFileRoute } from "@tanstack/react-router";
import { AdminSpamPage } from "@/admin/pages/AdminSpamPage";

export const Route = createFileRoute("/admin/spam")({
  component: AdminSpamPage,
});
