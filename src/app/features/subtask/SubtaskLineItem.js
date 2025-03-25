import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useSubTaskIsComplete from "@/hooks/useSubTaskIsComplete";
import useSubtaskUpdateField from "@/hooks/useSubTaskUpdateField";
import React, { useState } from "react";

const SubtaskLineItem = ({ item }) => {
  const mutation = useSubTaskIsComplete();
  const updateFieldMutation = useSubtaskUpdateField();

  const completeButtonClick = () => {
    const updateInfo = { isComplete: !item.isComplete };
    mutation.mutate({
      id: item.subTask_id,
      data: updateInfo,
      parent_id: item.task_id,
    });
  };

  const updateFieldBlur = (subTask_id, field, value) => {
    updateFieldMutation.mutate({
      id: subTask_id,
      changedField: field,
      updateData: value,
      parent_id: item.task_id,
    });
  };

  const [updateField, setUpdateField] = useState(item.subTask_name);
  return (
    <div className="flex items-center space-x-1 font-thin text-sm">
      {item.isComplete ? (
        <Button
          className=" bg-green-700 h-3 w-3 rounded-full "
          size="basic"
          onClick={completeButtonClick}
        ></Button>
      ) : (
        <Button
          className=" bg-red-700 h-3 w-3 rounded-full "
          size="basic"
          onClick={completeButtonClick}
        ></Button>
      )}

      <Input
        className="border-none"
        value={updateField}
        placeholder={item.subTask_name}
        onChange={(e) => setUpdateField(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            updateFieldBlur(item.subTask_id, "subTask_name", updateField);
          }
        }}
      />
    </div>
  );
};

export default SubtaskLineItem;
