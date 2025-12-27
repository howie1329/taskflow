import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TaskDone01Icon,
  Note01Icon,
  MessageMultiple01Icon,
  Search02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons/index";
import useSmartSearch from "@/hooks/search/useSmartSearch";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const GlobalSmartSearch = ({
  isGlobalSmartSearchOpen,
  setIsGlobalSmartSearchOpen,
}) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: results, isLoading, isError } = useSmartSearch(debouncedSearch);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, []);

  const handleTaskClick = useCallback((taskId) => {
    router.push(`/mainview/task?taskId=${taskId}`);
    setIsGlobalSmartSearchOpen(false);
    setSearch("");
  }, [router, setIsGlobalSmartSearchOpen]);

  const handleNoteClick = useCallback((noteId) => {
    router.push(`/mainview/notes/${noteId}`);
    setIsGlobalSmartSearchOpen(false);
    setSearch("");
  }, [router, setIsGlobalSmartSearchOpen]);

  const handleMessageClick = useCallback((conversationId) => {
    router.push(`/mainview/aichat/${conversationId}`);
    setIsGlobalSmartSearchOpen(false);
    setSearch("");
  }, [router, setIsGlobalSmartSearchOpen]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const hasResults = results && (
    (results.tasks && results.tasks.length > 0) ||
    (results.notes && results.notes.length > 0) ||
    (results.messages && results.messages.length > 0)
  );

  return (
    <CommandDialog
      open={isGlobalSmartSearchOpen}
      onOpenChange={setIsGlobalSmartSearchOpen}
      className="max-w-2xl"
    >
      <Command shouldFilter={false} className="rounded-lg">
        <CommandInput
          placeholder="Search for tasks, notes, and messages..."
          value={search}
          onValueChange={handleSearchChange}
          className="h-12 text-base"
        />
        <CommandList className="max-h-[500px]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col gap-3 items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex flex-col gap-3 items-center justify-center py-12">
              <HugeiconsIcon
                icon={AlertCircleIcon}
                size={32}
                strokeWidth={2}
                className="text-destructive"
              />
              <div className="text-center">
                <p className="text-sm font-medium">Error loading results</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please try again later
                </p>
              </div>
            </div>
          )}

          {/* Empty State - No Search */}
          {!isLoading && !isError && !debouncedSearch && (
            <div className="flex flex-col gap-3 items-center justify-center py-12">
              <HugeiconsIcon
                icon={Search02Icon}
                size={32}
                strokeWidth={2}
                className="text-muted-foreground/50"
              />
              <div className="text-center">
                <p className="text-sm font-medium">Start searching</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Type to search across tasks, notes, and messages
                </p>
              </div>
            </div>
          )}

          {/* Empty State - No Results */}
          {!isLoading && !isError && debouncedSearch && !hasResults && (
            <div className="flex flex-col gap-3 items-center justify-center py-12">
              <HugeiconsIcon
                icon={Search02Icon}
                size={32}
                strokeWidth={2}
                className="text-muted-foreground/50"
              />
              <div className="text-center">
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching with different keywords
                </p>
              </div>
            </div>
          )}

          {/* Tasks Results */}
          {!isLoading && !isError && results && results.tasks && results.tasks.length > 0 && (
            <>
              <CommandGroup heading="Tasks" className="px-2 py-3">
                {results.tasks.map((task) => (
                  <CommandItem
                    key={task.id}
                    onSelect={() => handleTaskClick(task.id)}
                    className="transition-colors hover:bg-accent/50 cursor-pointer py-3 px-3 rounded-md mb-1 aria-selected:bg-accent"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-shrink-0 mt-0.5">
                        <HugeiconsIcon
                          icon={TaskDone01Icon}
                          size={18}
                          strokeWidth={2}
                          className="text-primary"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {task.status && (
                            <Badge
                              variant="secondary"
                              className="text-xs h-5 px-2"
                            >
                              {task.status}
                            </Badge>
                          )}
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground">
                              Due {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              {((results.notes && results.notes.length > 0) ||
                (results.messages && results.messages.length > 0)) && (
                <Separator className="my-2" />
              )}
            </>
          )}

          {/* Notes Results */}
          {!isLoading && !isError && results && results.notes && results.notes.length > 0 && (
            <>
              <CommandGroup heading="Notes" className="px-2 py-3">
                {results.notes.map((note) => (
                  <CommandItem
                    key={note.id}
                    onSelect={() => handleNoteClick(note.id)}
                    className="transition-colors hover:bg-accent/50 cursor-pointer py-3 px-3 rounded-md mb-1 aria-selected:bg-accent"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-shrink-0 mt-0.5">
                        <HugeiconsIcon
                          icon={Note01Icon}
                          size={18}
                          strokeWidth={2}
                          className="text-primary"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">
                          {note.title}
                        </div>
                        {note.updatedAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Updated {formatDate(note.updatedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              {results.messages && results.messages.length > 0 && (
                <Separator className="my-2" />
              )}
            </>
          )}

          {/* Messages Results */}
          {!isLoading && !isError && results && results.messages && results.messages.length > 0 && (
            <CommandGroup heading="Messages" className="px-2 py-3">
              {results.messages.map((message) => (
                <CommandItem
                  key={message.id}
                  onSelect={() => handleMessageClick(message.conversationId || message.conversation_id)}
                  className="transition-colors hover:bg-accent/50 cursor-pointer py-3 px-3 rounded-md mb-1 aria-selected:bg-accent"
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      <HugeiconsIcon
                        icon={MessageMultiple01Icon}
                        size={18}
                        strokeWidth={2}
                        className="text-primary"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm line-clamp-2">
                        {message.content}
                      </div>
                      {message.timestamp && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(message.timestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
