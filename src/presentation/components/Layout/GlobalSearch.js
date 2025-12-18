import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import useSmartSearch from "@/hooks/search/useSmartSearch";
import { useCallback, useEffect, useState } from "react";

export const GlobalSmartSearch = ({
  isGlobalSmartSearchOpen,
  setIsGlobalSmartSearchOpen,
}) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: results, isLoading, isError } = useSmartSearch(debouncedSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, []);

  return (
    <CommandDialog
      open={isGlobalSmartSearchOpen}
      onOpenChange={setIsGlobalSmartSearchOpen}
      className="rounded-none"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search..."
          value={search}
          onValueChange={handleSearchChange}
        />
        <CommandList>
          <div className="flex flex-col gap-2 items-center justify-center py-2">
            {isLoading && (
              <Badge variant="outline">
                <Spinner /> Loading...
              </Badge>
            )}
            {isError && <Badge variant="outline">Error loading results.</Badge>}
            {!isLoading && !isError && results === undefined && (
              <Badge variant="outline">No results found.</Badge>
            )}
          </div>
          <CommandGroup heading="Tasks">
            {results &&
              results.tasks.map((task) => (
                <CommandItem key={task.id}>{task.title}</CommandItem>
              ))}
          </CommandGroup>
          <CommandGroup heading="Notes">
            {results &&
              results.notes.map((note) => (
                <CommandItem key={note.id}>{note.title}</CommandItem>
              ))}
          </CommandGroup>
          <CommandGroup heading="Messages">
            {results &&
              results.messages.map((message) => (
                <CommandItem key={message.id}>{message.content}</CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
