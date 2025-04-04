"use client";
import AppSidebar from "@/components/ui/app-sidebar";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  useSyncIndexedDBWithRedis,
  useSyncRedisToSupabase,
} from "@/lib/caching/hooks/SyncHooks";

export default function Layout({ children }) {
  useSyncRedisToSupabase();
  useSyncIndexedDBWithRedis();
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
