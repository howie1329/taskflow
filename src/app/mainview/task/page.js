import { TaskFilterProvider } from "@/presentation/components/task/TaskFilterContext";
import { TaskDataProvider } from "@/presentation/components/task/TaskDataProvider";
import { TaskPageClient } from "@/presentation/components/task/TaskPageClient";

/**
 * Task Page - Server Component
 * 
 * This page is now a server component that composes client components.
 * 
 * Architecture:
 * - TaskFilterProvider: Manages filter state (replaces Zustand)
 * - TaskDataProvider: Fetches and filters data (depends on TaskFilterProvider)
 * - TaskPageClient: Renders UI and handles interactions
 * 
 * It can be extended to:
 * - Accept board type as a query parameter or prop
 * - Pass server-side configuration to client components
 * - Handle server-side data fetching if needed
 */
function Page() {
  // In the future, you could:
  // - Read board type from searchParams: const boardType = searchParams?.board || "kanban"
  // - Pass server-side config: const boardConfig = await getBoardConfig()
  
  return (
    <TaskFilterProvider>
      <TaskDataProvider>
        <TaskPageClient 
          boardType="kanban" 
          boardConfig={{}}
        />
      </TaskDataProvider>
    </TaskFilterProvider>
  );
}

export default Page;
