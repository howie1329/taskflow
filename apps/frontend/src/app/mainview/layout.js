"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
    <div className="[--header-height:3.5rem] h-svh w-[100swv] overflow-hidden">
      <SocketProvider>
        <QueryClientProvider client={queryClient}>
          <SidebarProvider className="flex flex-col h-full w-full overflow-hidden">
            <AppHeader
              isGlobalSmartSearchOpen={isGlobalSmartSearchOpen}
              setIsGlobalSmartSearchOpen={setIsGlobalSmartSearchOpen}
            />
            <div className="flex h-full w-full overflow-hidden">
              <AppSideBar />
              <SidebarInset>
                <GlobalSmartSearch
                  isGlobalSmartSearchOpen={isGlobalSmartSearchOpen}
                  setIsGlobalSmartSearchOpen={setIsGlobalSmartSearchOpen}
                />
                <main className="flex flex-col h-[calc(100svh-var(--header-height))] w-full overflow-hidden ">
                  {children}
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </QueryClientProvider>
      </SocketProvider>
    </div>
  );
}
