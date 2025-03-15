import react from "react";
import TaskDashboard from "./components/TaskDashboard";

function Page() {
  return (
    <div className="flex m-2 flex-col items-center flex-1">
      <TaskDashboard />
    </div>
  );
}

export default Page;
