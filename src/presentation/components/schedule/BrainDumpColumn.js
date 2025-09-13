import { TaskCard } from "../task/TaskCard";

export const BrainDumpColumn = ({ data }) => {
  // Loading State If No Data
  if (!data) {
    return (
      <div className="col-span-1 bg-[#fafafa] shadow-md rounded-lg p-1">
        <h2 className="text-sm font-semibold text-gray-700 text-center">
          Brain Dump
        </h2>
        <div className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 p-1">
          <p className="text-xs text-gray-500 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-1 bg-[#fafafa] shadow-md rounded-lg p-1">
      <h2 className="text-sm font-semibold text-gray-700 text-center">
        Brain Dump
      </h2>
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto h-[83vh]">
        {data.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};
