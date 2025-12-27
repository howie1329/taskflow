"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { GlobalSmartSearch } from "@/presentation/components/Layout/GlobalSearch";
import AppSideBar from "@/presentation/components/Layout/AppSideBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SocketProvider } from "@/lib/sockets/SocketProvider";

export default function Layout({ children }) {
  const [isGlobalSmartSearchOpen, setIsGlobalSmartSearchOpen] = useState(false);
  const queryClient = new QueryClient();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsGlobalSmartSearchOpen(!isGlobalSmartSearchOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGlobalSmartSearchOpen]);

  return (
    <SocketProvider>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <AppSideBar />
          <SidebarInset>
            <GlobalSmartSearch
              isGlobalSmartSearchOpen={isGlobalSmartSearchOpen}
              setIsGlobalSmartSearchOpen={setIsGlobalSmartSearchOpen}
            />
            <main className=" h-[100vh]">
              {/* Mobile-only content to trigger the sidebar... Need to come up with a better solution*/}
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </QueryClientProvider>
    </SocketProvider>
  );
}
