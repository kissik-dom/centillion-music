import { Outlet } from "react-router-dom";
import { SidebarProvider } from "./ui/sidebar";

export function PublicLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex flex-col w-full">
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
