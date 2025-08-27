import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export const TaskCardDialog = ({ selectedTask, isOpen, onOpenChange }) => {
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
              {getLabels(selectedTask.labels).map((label) => (
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
        </div>
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
  const labels = stringLabels.split(",");
  return labels.map((label) => label.trim());
};
