import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSideBar from "@/presentation/components/Layout/AppSideBar";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSideBar />
      <SidebarInset>
        <main className="p-2">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
