"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { GlobalSmartSearch } from "@/presentation/components/Layout/GlobalSearch";
import useSocketConnection from "@/lib/sockets/useSocketConnection";
import AppSideBar from "@/presentation/components/Layout/AppSideBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const SocketInitializer = () => {
  useSocketConnection();
  return null;
};

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
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <AppSideBar />
        <SidebarInset>
          <GlobalSmartSearch
            isGlobalSmartSearchOpen={isGlobalSmartSearchOpen}
            setIsGlobalSmartSearchOpen={setIsGlobalSmartSearchOpen}
          />
          <SocketInitializer />
          <main className=" h-[98vh] rounded-md border">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
