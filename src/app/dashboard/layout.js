"use client";
import AppSidebar from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  useRedisToIndexedDb,
  useRedisToSupabaseSync,
} from "@/lib/caching/hooks/DataSync";
import { useSocketClientListener } from "@/lib/socket/socketClientListener";
import { useSocketClient } from "@/lib/socket/useSocketClient";
import { socket } from "@/lib/socket/socketClient";

export default function Layout({ children }) {
  useRedisToSupabaseSync();
  useRedisToIndexedDb();
  useSocketClient();
  useSocketClientListener(socket);
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
