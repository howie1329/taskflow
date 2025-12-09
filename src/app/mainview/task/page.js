import { TaskFilterProvider } from "@/presentation/components/task/home/TaskFilterProvider";
import { TaskDataProvider } from "@/presentation/components/task/home/TaskDataProvider";
import { TaskPageClient } from "@/presentation/components/task/home/TaskPageClient";

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
