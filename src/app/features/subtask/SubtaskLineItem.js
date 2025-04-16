import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import useSubTaskIsComplete from "@/hooks/useSubTaskIsComplete";
import useSubtaskUpdateField from "@/hooks/useSubTaskUpdateField";
import { useAuth } from "@clerk/nextjs";
import React, { useState } from "react";

const SubtaskLineItem = ({ item }) => {
  const { getToken } = useAuth();
  const mutation = useSubTaskIsComplete(getToken);
  const updateFieldMutation = useSubtaskUpdateField(getToken);

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
      <Checkbox
        checked={item.isCompleted}
        onCheckedChange={completeButtonClick}
      />

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
