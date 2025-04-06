"use client";
import AppSidebar from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  useRedisToIndexedDb,
  useRedisToSupabaseSync,
} from "@/lib/caching/hooks/DataSync";

export default function Layout({ children }) {
  useRedisToSupabaseSync();
  useRedisToIndexedDb();
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
