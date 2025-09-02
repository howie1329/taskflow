"use client";
import { TaskCard } from "./TaskCard";
import { useState } from "react";
import { useTaskUIStore } from "@/presentation/hooks/useTaskUIStore";
import { DndContext, useDroppable } from "@dnd-kit/core";
import { usePrefetchSubtasks } from "@/hooks/tasks/subtasks/usePrefetchSubtasks";

export const GeneralKanbanTaskBoard = ({ data }) => {
  const prefetchSubtasks = usePrefetchSubtasks();
  const { setFilteredData, filteredData } = useTaskUIStore();
  const [boardColumns] = useState([
    { id: "notStarted", title: "Not Started", tasks: [] },
    { id: "todo", title: "To Do", tasks: [] },
    { id: "inProgress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
    { id: "overdue", title: "Overdue", tasks: [] },
  ]);

  // Filter the board columns based on the task data
  const filteredBoardColumns = (taskData) => {
    if (!taskData) return boardColumns;
    boardColumns.forEach((column) => {
      const data = taskData.filter((task) => task.status === column.id);
      column.tasks = data;
    });
    return boardColumns;
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over) {
      const { id: overId } = over;
      const { id: activeId } = active;
      setFilteredData(
        filteredData.map((task) =>
          task.id === activeId ? { ...task, status: overId } : task
        )
      );
    }
  };

  return (
    <div className="h-full p-1">
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 h-full gap-2">
          {filteredBoardColumns(data).map((column) => (
            <Column
              key={column.id}
              column={column}
              prefetchHover={prefetchSubtasks}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

const Column = ({ column, prefetchHover }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  const style = {
    backgroundColor: isOver ? "lightgreen" : undefined,
  };
  return (
    <div
      className="flex flex-col bg-[#fafafa] rounded-lg shadow-sm h-full min-h-0"
      ref={setNodeRef}
      style={style}
    >
      <h3 className="text-sm font-semibold text-gray-700 text-center py-1 flex-shrink-0">
        {column.title}
      </h3>
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 p-1">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} prefetchHover={prefetchHover} />
        ))}
      </div>
    </div>
  );
};
