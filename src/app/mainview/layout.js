"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import useSmartSearch from "@/hooks/search/useSmartSearch";
import useFetchAllTasks from "@/hooks/tasks/useFetchAllTasks";
import AppSideBar from "@/presentation/components/Layout/AppSideBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

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
          {isGlobalSmartSearchOpen && <GlobalSmartSearch />}
          <main className=" h-[98vh] p-1 border rounded-md">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
const GlobalSmartSearch = () => {
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: results, isLoading } = useSmartSearch(searchQuery);

  const handleSearch = () => {
    setSearchQuery(search);
  };
  return (
    <div className="absolute z-50 top-50 bottom-50 left-0 w-full h-[80vh] backdrop-blur-sm">
      <Input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button onClick={handleSearch}>Search</Button>
      {isLoading && <div>Loading...</div>}
      <div className="flex flex-col gap-1 overflow-y-auto h-full">
        {results &&
          results.tasks.map((task) => <div key={task.id}>{task.title}</div>)}

        {results &&
          results.messages.map((message) => (
            <div key={message.id}>{message.content}</div>
          ))}

        {results &&
          results.notes.map((note) => <div key={note.id}>{note.title}</div>)}
      </div>
    </div>
  );
};
