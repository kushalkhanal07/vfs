import { Outlet, createFileRoute } from "@tanstack/react-router";
import { DashboardSidebar } from "@/dashboard/components/DashboardSidebar";
import { DashboardTopBar } from "@/dashboard/components/DashboardTopBar";
import { DashboardMobileNav } from "@/dashboard/components/DashboardMobileNav";
import { VaultProvider } from "@/contexts/vaultContext";
import { SearchProvider } from "@/contexts/searchContext";
import { NotesProvider } from "@/contexts/notesContext";
import { RevisionProvider } from "@/contexts/revisionContext";
import { NotificationsProvider } from "@/contexts/notificationsContext";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <VaultProvider>
      <SearchProvider>
        <NotesProvider>
          <RevisionProvider>
            <NotificationsProvider>
              <div className="flex min-h-screen w-full">
                <DashboardSidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                  <DashboardTopBar />
                  <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-10 animate-fade-in">
                    <Outlet />
                  </main>
                </div>
                <DashboardMobileNav />
              </div>
            </NotificationsProvider>
          </RevisionProvider>
        </NotesProvider>
      </SearchProvider>
    </VaultProvider>
  );
}
