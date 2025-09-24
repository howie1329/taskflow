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
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, []);

  console.log("Tasks:", results?.tasks?.length || 0);
  console.log("Messages:", results?.messages?.length || 0);
  console.log("Notes:", results?.notes?.length || 0);

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
        <CommandGroup heading="Notes">
          {results &&
            results.notes.map((note) => (
              <CommandItem key={note.id}>{note.title}</CommandItem>
            ))}
        </CommandGroup>
        <CommandGroup heading="Tasks">
          {results &&
            results.tasks.map((task) => (
              <CommandItem key={task.id}>{task.title}</CommandItem>
            ))}
        </CommandGroup>
        <CommandGroup heading="Messages">
          {results &&
            results.messages.map((message) => (
              <CommandItem key={message.id}>{message.content}</CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
