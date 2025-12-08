"use client";
import { TaskCard } from "../TaskCard";
import { useState } from "react";
import { DndContext, useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import useUpdateTask from "@/hooks/tasks/useUpdateTask";

/**
 * KanbanBoard - A kanban-style board implementation
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of task objects
 * @param {Function} props.onTaskUpdate - Callback when task is updated
 * @param {Object} props.config - Configuration options
 * @param {Array} props.config.columns - Custom column definitions (optional)
 */
export const KanbanBoard = ({ data = [], onTaskUpdate, config = {} }) => {
  const { mutate: updateTask } = useUpdateTask();
  
  const defaultColumns = [
    { id: "notStarted", title: "Not Started", tasks: [] },
    { id: "todo", title: "To Do", tasks: [] },
    { id: "inProgress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
    { id: "overdue", title: "Overdue", tasks: [] },
  ];

  const [boardColumns] = useState(config.columns || defaultColumns);

  // Filter the board columns based on the task data
  const filteredBoardColumns = (taskData) => {
    if (!taskData) return boardColumns;
    return boardColumns.map((column) => ({
      ...column,
      tasks: taskData.filter((task) => task.status === column.id),
    }));
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const taskId = active.id;
      const newStatus = over.id;
      
      // Find the task
      const task = data.find((t) => t.id === taskId);
      if (!task) return;

      // Update task via API
      updateTask(
        { 
          taskId: taskId,
          taskData: { ...task, status: newStatus }
        },
        {
          onSuccess: () => {
            // Call the callback if provided
            if (onTaskUpdate) {
              onTaskUpdate(taskId, { status: newStatus });
            }
          },
        }
      );
    }
  };

  const columns = filteredBoardColumns(data);

  return (
    <div className="h-full p-1">
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 h-full gap-2 bg-card/50">
          {columns.map((column) => (
            <Column key={column.id} column={column} />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

const Column = ({ column }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  const style = {
    backgroundColor: isOver ? "lightgreen" : undefined,
  };
  
  return (
    <div
      className="flex flex-col bg-card/50 border h-full min-h-0"
      ref={setNodeRef}
      style={style}
    >
      <h3 className="flex flex-row justify-center items-center gap-1 text-sm font-semibold text-gray-700 text-center py-1 flex-shrink-0">
        {column.title}
        <Badge variant="outline" className="text-xs">
          {column.tasks.length}
        </Badge>
      </h3>
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 p-1">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};
