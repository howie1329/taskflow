"use client";
import { GeneralKanbanTaskBoard } from "../../projects/GeneralKanbanTaskBoard";
import { useTaskData } from "./TaskDataProvider";
import { motion } from "motion/react";
import { TaskHeader } from "./TaskHeader";

export const TaskPageClient = () => {
  const { filteredTasks, isLoading, error } = useTaskData();

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col h-full"
    >
      <TaskHeader />
      <GeneralKanbanTaskBoard data={filteredTasks} />
    </motion.div>
  );
};
