import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckIcon } from "lucide-react";
import React, { useState } from "react";

const SubTaskInput = ({ task, subTask, setSubTask, index }) => {
  const [focus, setFocus] = useState(false);
  const onClick = () => {
    setSubTask([...subTask, {}]);
    setFocus(false);
  };

  const onBlurTest = () => {
    setTimeout(() => {
      setFocus(false);
    }, 3000);
  };
  return (
    <div className="flex w-full items-center justify-center space-x-2">
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
        onFocus={() => setFocus(true)}
        onBlur={onBlurTest}
      />
      {focus ? (
        <Button size="sm" type="button" onClick={onClick}>
          <CheckIcon />
        </Button>
      ) : null}
    </div>
  );
};

export default SubTaskInput;
