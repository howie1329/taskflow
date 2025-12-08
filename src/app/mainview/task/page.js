import { TaskDataProvider } from "@/presentation/components/task/TaskDataProvider";
import { TaskPageClient } from "@/presentation/components/task/TaskPageClient";

/**
 * Task Page - Server Component
 * 
 * This page is now a server component that composes client components.
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
    <TaskDataProvider>
      <TaskPageClient 
        boardType="kanban" 
        boardConfig={{}}
      />
    </TaskDataProvider>
  );
}

export default Page;
