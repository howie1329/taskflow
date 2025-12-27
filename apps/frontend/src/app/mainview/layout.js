"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GlobalSmartSearch } from "@/presentation/components/Layout/GlobalSearch";
import AppSideBar from "@/presentation/components/Layout/AppSideBar";
import AppHeader from "@/presentation/components/Layout/AppHeader";
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
          {/* Left Sidebar */}
          <AppSideBar />

          {/* Main Content Area with Header */}
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Persistent Header */}
            <AppHeader />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <GlobalSmartSearch
                isGlobalSmartSearchOpen={isGlobalSmartSearchOpen}
                setIsGlobalSmartSearchOpen={setIsGlobalSmartSearchOpen}
              />
              {children}
            </main>
          </div>
        </SidebarProvider>
      </QueryClientProvider>
    </SocketProvider>
  );
}
