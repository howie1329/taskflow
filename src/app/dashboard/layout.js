import AppSidebar from "@/components/ui/app-sidebar";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="font-second w-screen h-screen overflow-hidden">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
