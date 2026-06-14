import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/session")({
  component: SessionLayout,
});

function SessionLayout() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Outlet />
    </div>
  );
}
