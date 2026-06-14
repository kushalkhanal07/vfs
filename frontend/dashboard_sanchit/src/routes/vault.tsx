import { createFileRoute } from "@tanstack/react-router";
import { VaultPage } from "@/components/VaultPageComponent";

export const Route = createFileRoute("/vault")({
  component: VaultPage,
});
