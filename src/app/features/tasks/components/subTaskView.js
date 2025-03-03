import { Input } from "@/components/ui/input";
import React from "react";

const SubTaskView = ({ task, subTask, setSubTask, index }) => {
  return (
    <div>
      <Input
        value={task.subTask_name}
        onChange={(e) =>
          setSubTask(
            subTask.map((item, i) =>
              i === index ? { ...item, subTask_name: e.target.value } : item
            )
          )
        }
        placeholder="Subtask "
      />
    </div>
  );
};

export default SubTaskView;
