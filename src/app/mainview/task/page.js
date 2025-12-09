import { TaskFilterProvider } from "@/presentation/components/task/Providers/TaskFilterProvider";
import { TaskDataProvider } from "@/presentation/components/task/Providers/TaskDataProvider";
import { TaskPageClient } from "@/presentation/components/task/Providers/TaskPageClient";

function Page() {
  return (
    <TaskFilterProvider>
      <TaskDataProvider>
        <TaskPageClient />
      </TaskDataProvider>
    </TaskFilterProvider>
  );
}

export default Page;
