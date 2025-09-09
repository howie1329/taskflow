import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useFetchTaskSubtask } from "@/hooks/tasks/subtasks/useFetchTaskSubtask";
import useDeleteTask from "@/hooks/tasks/useDeleteTask";
import { Trash2Icon } from "lucide-react";

export const TaskCardDialog = ({ selectedTask, isOpen, onOpenChange }) => {
  const { data: subtasks, isLoading: subtaskLoading } = useFetchTaskSubtask(
    selectedTask.id,
    isOpen
  );
  const { mutate: deleteTask } = useDeleteTask();

  const deleteButtonClick = () => {
    deleteTask(selectedTask.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[50vw] !max-w-[60vw] ">
        <DialogHeader>
          <DialogTitle className="">{selectedTask.title}</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="grid grid-cols-1 gap-2">
          <div className="flex flex-row items-center col-span-1 gap-2">
            <h3 className="text-sm font-medium">Status:</h3>
            <p className="text-sm text-gray-500">
              {getCorrectedStatus(selectedTask.status)}
            </p>
          </div>
          <div className="flex flex-row items-center col-span-1 gap-2">
            <h3 className="text-sm font-medium">Due Date:</h3>
            <p className="text-sm text-gray-500">{selectedTask.date}</p>
          </div>

          <div className="flex flex-row items-center col-span-1 gap-2">
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

          <div className="flex flex-col col-span-1">
            <h3 className="text-sm font-medium">Description:</h3>
            <p className="text-sm text-gray-500">{selectedTask.description}</p>
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
                    <Checkbox key={subTask.id} checked={subTask.is_complete} />
                    <p className="text-sm text-gray-500" key={subTask.id}>
                      {subTask.subtask_name}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <Separator />
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={deleteButtonClick}>
            <Trash2Icon className="h-2 w-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
