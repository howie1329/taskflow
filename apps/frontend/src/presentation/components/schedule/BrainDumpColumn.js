import { TaskCard } from "../task/TaskCard";

export const BrainDumpColumn = ({ data }) => {
  // Loading State If No Data
  if (!data) {
    return (
      <div className="flex flex-col bg-[#fafafa] rounded-md border h-full p-1">
        <h2 className="text-sm font-semibold text-gray-700 text-center">
          Brain Dump
        </h2>
        <div className="flex flex-col gap-1 flex-1 overflow-y-auto h-full p-1">
          <p className="text-xs text-gray-500 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#fafafa] rounded-md border p-1 h-full">
      <h2 className="text-sm font-semibold text-gray-700 text-center">
        Brain Dump
      </h2>
      <div className="flex flex-col flex-1 gap-1 overflow-y-auto h-full">
        {data.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};
