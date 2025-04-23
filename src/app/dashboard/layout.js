"use client";
import AppSidebar from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  useRedisToIndexedDb,
  useRedisToSupabaseSync,
} from "@/lib/caching/hooks/DataSync";
import { useSocketClientListener } from "@/lib/socket/socketClientListener";
import { useSocketClient } from "@/lib/socket/useSocketClient";
import { useStart } from "@/lib/socket/socketClient";
import { useAuth } from "@clerk/nextjs";

export default function Layout({ children }) {
  const { getToken, userId } = useAuth();

  useStart(userId);
  useRedisToSupabaseSync();
  useRedisToIndexedDb();
  useSocketClient();
  useSocketClientListener();
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
