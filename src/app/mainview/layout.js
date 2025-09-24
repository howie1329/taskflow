"use client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import useSmartSearch from "@/hooks/search/useSmartSearch";
import AppSideBar from "@/presentation/components/Layout/AppSideBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

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
          <main className=" h-[98vh] p-1 border rounded-md">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
const GlobalSmartSearch = ({
  isGlobalSmartSearchOpen,
  setIsGlobalSmartSearchOpen,
}) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: results } = useSmartSearch(debouncedSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, []);

  return (
    <CommandDialog
      open={isGlobalSmartSearchOpen}
      onOpenChange={setIsGlobalSmartSearchOpen}
    >
      <CommandInput
        placeholder="Search..."
        value={search}
        onValueChange={handleSearchChange}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Tasks">
          {results &&
            results.tasks.map((task) => (
              <CommandItem key={task.id}>{task.title}</CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
