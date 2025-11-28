import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import useCompleteSubtask from "@/hooks/tasks/subtasks/useCompleteSubtask";
import { useFetchTaskSubtask } from "@/hooks/tasks/subtasks/useFetchTaskSubtask";
import useIncompleteSubtask from "@/hooks/tasks/subtasks/useIncompleteSubtask";
import useDeleteTask from "@/hooks/tasks/useDeleteTask";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";

export const TaskCardSheet = ({ selectedTask, isOpen, onOpenChange }) => {
  const { data: subtasks, isLoading: subtaskLoading } = useFetchTaskSubtask(
    selectedTask.id,
    isOpen
  );
  const [title, setTitle] = useState(selectedTask.title);
  const [description, setDescription] = useState(selectedTask.description);
  const [notes, setNotes] = useState(selectedTask.notes);
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: completeSubtask } = useCompleteSubtask();
  const { mutate: incompleteSubtask } = useIncompleteSubtask();

  const handleCheckedChange = (subtaskId, isComplete) => {
    if (isComplete) {
      incompleteSubtask({ id: subtaskId, taskId: selectedTask.id });
    } else {
      completeSubtask({ id: subtaskId, taskId: selectedTask.id });
    }
  };

  const deleteButtonClick = () => {
    deleteTask(selectedTask.id);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="grid grid-rows-[auto_1fr_1fr_auto] !w-[30vw] !max-w-[30vw] gap-0 p-2">
        <SheetHeader className="flex flex-col gap-0 p-0">
          <SheetTitle className="">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
            />
          </SheetTitle>
          <SheetDescription>{selectedTask.description}</SheetDescription>
          <Separator />
        </SheetHeader>
        <div className="grid grid-rows-[auto_auto_auto_1fr] gap-3">
          <div className="flex flex-row items-center ">
            <h3 className="text-sm font-medium"> Status:</h3>
            <p className="text-sm text-gray-500">
              {getCorrectedStatus(selectedTask.status)}
            </p>
          </div>
          <div className="flex flex-row items-center">
            <h3 className="text-sm font-medium">Due Date: </h3>
            <p className="text-sm text-gray-500">{selectedTask.date}</p>
          </div>

          <div className="flex flex-row items-center">
            <h3 className="text-sm font-medium">Labels:</h3>
            <div className="flex flex-row items-center gap-2 line-clamp-2">
              {selectedTask.labels &&
                selectedTask.labels.map((label) => (
                  <Badge key={label} variant="outline">
                    {label.charAt(0).toUpperCase() + label.slice(1)}
                  </Badge>
                ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Subtasks:</h3>
            <div className="flex flex-col gap-2">
              {subtasks &&
                subtasks.map((subTask) => (
                  <div
                    className="flex flex-row items-center gap-2"
                    key={subTask.id}
                  >
                    <Checkbox
                      key={subTask.id}
                      checked={subTask.isComplete}
                      onCheckedChange={(e) => {
                        handleCheckedChange(subTask.id, subTask.isComplete);
                      }}
                      onClick={(e) =>
                        handleCheckedChange(subTask.id, subTask.isComplete)
                      }
                    />
                    <p className="text-sm text-gray-500" key={subTask.id}>
                      {subTask.subtaskName}
                    </p>
                  </div>
                ))}
              <h3 className="text-sm font-medium">Notes:</h3>
              <Textarea
                className="h-full"
                placeholder="Add notes to this task"
              />
            </div>
          </div>
        </div>
        <SheetFooter>
          <Separator />
          <Button variant="outline" size="sm" onClick={deleteButtonClick}>
            <Trash2Icon className="h-2 w-2" />
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

const getCorrectedStatus = (status) => {
  switch (status) {
    case "notStarted":
      return "Not Started";
    case "todo":
      return "Todo";
    case "inProgress":
      return "In Progress";
    case "done":
      return "Done";
    case "overdue":
      return "Overdue";
    default:
      return status;
  }
};

const getLabels = (stringLabels) => {
  //const labels = stringLabels.split(",");
  console.log("STRING LABELS", stringLabels);
  const labels = stringLabels;
  return labels.map((label) => label.trim());
};
