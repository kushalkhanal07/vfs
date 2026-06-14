import { createFileRoute } from "@tanstack/react-router";
import { NotesPage } from "@/components/NotesPage";

export const Route = createFileRoute("/dashboard/notes")({
  component: NotesPage,
});
