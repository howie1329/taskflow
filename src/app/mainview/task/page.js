import { TaskFilterProvider } from "@/presentation/components/task/home/TaskFilterProvider";
import { TaskDataProvider } from "@/presentation/components/task/home/TaskDataProvider";
import { TaskHeader } from "@/presentation/components/task/home/TaskHeader";
import { TaskPageClient } from "@/presentation/components/task/home/TaskPageClient";

function Page() {
  return (
    <TaskFilterProvider>
      <TaskDataProvider>
        <div className="flex flex-col h-[96vh] p-2 ">
          <TaskHeader />
          <TaskPageClient />
        </div>
      </TaskDataProvider>
    </TaskFilterProvider>
  );
}

export default Page;
