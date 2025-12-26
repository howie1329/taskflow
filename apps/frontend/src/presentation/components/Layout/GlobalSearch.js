import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import useSmartSearch from "@/hooks/search/useSmartSearch";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare2Icon,
  FileTextIcon,
  MessageSquareIcon,
  SearchIcon,
} from "lucide-react";

export const GlobalSmartSearch = ({
  isGlobalSmartSearchOpen,
  setIsGlobalSmartSearchOpen,
}) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const router = useRouter();
  const { data: results, isLoading, isError, error } = useSmartSearch(
    debouncedSearch
  );

  // Optimize debounce timing - faster for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // Reduced from 500ms to 300ms
    return () => clearTimeout(timer);
  }, [search]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!isGlobalSmartSearchOpen) {
      setSearch("");
      setDebouncedSearch("");
    }
  }, [isGlobalSmartSearchOpen]);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, []);

  const handleTaskClick = useCallback(
    (taskId) => {
      setIsGlobalSmartSearchOpen(false);
      // Navigate to task - adjust route based on your app structure
      router.push(`/mainview/todo`);
    },
    [router, setIsGlobalSmartSearchOpen]
  );

  const handleNoteClick = useCallback(
    (noteId) => {
      setIsGlobalSmartSearchOpen(false);
      router.push(`/mainview/notes/${noteId}`);
    },
    [router, setIsGlobalSmartSearchOpen]
  );

  const handleMessageClick = useCallback(
    (messageId) => {
      setIsGlobalSmartSearchOpen(false);
      router.push(`/mainview/aichat/${messageId}`);
    },
    [router, setIsGlobalSmartSearchOpen]
  );

  const hasResults =
    results &&
    (results.tasks?.length > 0 ||
      results.notes?.length > 0 ||
      results.messages?.length > 0);

  const totalResults =
    (results?.tasks?.length || 0) +
    (results?.notes?.length || 0) +
    (results?.messages?.length || 0);

  // Truncate text helper
  const truncateText = (text, maxLength = 60) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <CommandDialog
      open={isGlobalSmartSearchOpen}
      onOpenChange={setIsGlobalSmartSearchOpen}
      className="rounded-none"
      title="Search"
      description="Search across tasks, notes, and messages"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search tasks, notes, messages..."
          value={search}
          onValueChange={handleSearchChange}
        />
        <CommandList>
          {isLoading && debouncedSearch && (
            <div className="flex flex-col gap-2 items-center justify-center py-8">
              <Spinner className="size-5" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col gap-2 items-center justify-center py-8">
              <Badge variant="destructive" className="gap-2">
                <span>Error loading results</span>
              </Badge>
              {error?.message && (
                <p className="text-xs text-muted-foreground">
                  {error.message}
                </p>
              )}
            </div>
          )}

          {!isLoading &&
            !isError &&
            debouncedSearch &&
            !hasResults && (
              <CommandEmpty>
                <div className="flex flex-col items-center gap-2 py-4">
                  <SearchIcon className="size-8 text-muted-foreground opacity-50" />
                  <p className="text-sm font-medium">No results found</p>
                  <p className="text-xs text-muted-foreground">
                    Try different keywords or check your spelling
                  </p>
                </div>
              </CommandEmpty>
            )}

          {!debouncedSearch && (
            <CommandEmpty>
              <div className="flex flex-col items-center gap-3 py-6">
                <SearchIcon className="size-8 text-muted-foreground opacity-50" />
                <div className="text-center">
                  <p className="text-sm font-medium mb-1">Start typing to search</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Search across tasks, notes, and messages
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap justify-center">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded">
                        ⌘
                      </kbd>
                      <span className="hidden sm:inline">or</span>
                      <kbd className="px-1.5 py-0.5 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded">
                        Ctrl
                      </kbd>
                      <span>+</span>
                      <kbd className="px-1.5 py-0.5 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded">
                        K
                      </kbd>
                      <span>to open</span>
                    </span>
                    <span className="text-muted-foreground/50 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded">
                        Esc
                      </kbd>
                      <span>to close</span>
                    </span>
                  </div>
                </div>
              </div>
            </CommandEmpty>
          )}

          {hasResults && (
            <>
              {totalResults > 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground border-b">
                  Found {totalResults} result{totalResults !== 1 ? "s" : ""}
                </div>
              )}

              {results.tasks && results.tasks.length > 0 && (
                <CommandGroup heading={`Tasks (${results.tasks.length})`}>
                  {results.tasks.map((task) => (
                    <CommandItem
                      key={task.id}
                      onSelect={() => handleTaskClick(task.id)}
                      className="flex items-start gap-3 py-3"
                    >
                      <CheckSquare2Icon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {truncateText(task.description, 80)}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.notes && results.notes.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={`Notes (${results.notes.length})`}>
                    {results.notes.map((note) => (
                      <CommandItem
                        key={note.id}
                        onSelect={() => handleNoteClick(note.id)}
                        className="flex items-start gap-3 py-3"
                      >
                        <FileTextIcon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {note.title || "Untitled Note"}
                          </div>
                          {note.description && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                              {truncateText(note.description, 80)}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {results.messages && results.messages.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={`Messages (${results.messages.length})`}>
                    {results.messages.map((message) => {
                      // Handle message content - could be parts array or string
                      const content =
                        typeof message.parts === "string"
                          ? message.parts
                          : Array.isArray(message.parts)
                          ? message.parts
                              .map((p) => p.text || p.content || "")
                              .join(" ")
                          : message.content || "";

                      return (
                        <CommandItem
                          key={message.id}
                          onSelect={() => handleMessageClick(message.id)}
                          className="flex items-start gap-3 py-3"
                        >
                          <MessageSquareIcon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground truncate">
                              {truncateText(content, 100)}
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
