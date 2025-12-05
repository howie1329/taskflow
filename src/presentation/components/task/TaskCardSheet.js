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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useCompleteSubtask from "@/hooks/tasks/subtasks/useCompleteSubtask";
import { useFetchTaskSubtask } from "@/hooks/tasks/subtasks/useFetchTaskSubtask";
import useIncompleteSubtask from "@/hooks/tasks/subtasks/useIncompleteSubtask";
import useDeleteTask from "@/hooks/tasks/useDeleteTask";
import useUpdateTask from "@/hooks/tasks/useUpdateTask";
import { Trash2Icon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export const TaskCardSheet = ({ selectedTask, isOpen, onOpenChange }) => {
  const { data: subtasks, isLoading: subtaskLoading } = useFetchTaskSubtask(
    selectedTask.id,
    isOpen
  );
  const [title, setTitle] = useState(selectedTask.title);
  const [description, setDescription] = useState(selectedTask.description);
  const [status, setStatus] = useState(selectedTask.status);
  const [notes, setNotes] = useState(selectedTask.notes);
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: completeSubtask } = useCompleteSubtask();
  const { mutate: incompleteSubtask } = useIncompleteSubtask();
  const { mutate: updateTask } = useUpdateTask();

  // Refs to store timeout IDs for debouncing
  const titleTimeoutRef = useRef(null);
  const descriptionTimeoutRef = useRef(null);
  const statusTimeoutRef = useRef(null);

  // Update local state when selectedTask changes
  useEffect(() => {
    setTitle(selectedTask.title);
    setDescription(selectedTask.description);
    setStatus(selectedTask.status);
    setNotes(selectedTask.notes);
  }, [selectedTask]);

  // Debounced update for title
  useEffect(() => {
    // Clear existing timeout
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current);
    }

    // Only update if title has actually changed from original
    if (title !== selectedTask.title) {
      titleTimeoutRef.current = setTimeout(() => {
        updateTask({
          taskId: selectedTask.id,
          taskData: { title },
        });
      }, 1000); // 1 second debounce
    }

    // Cleanup timeout on unmount or when title changes
    return () => {
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current);
      }
    };
  }, [title, selectedTask.id, selectedTask.title, updateTask]);

  // Debounced update for description
  useEffect(() => {
    // Clear existing timeout
    if (descriptionTimeoutRef.current) {
      clearTimeout(descriptionTimeoutRef.current);
    }

    // Only update if description has actually changed from original
    if (description !== selectedTask.description) {
      descriptionTimeoutRef.current = setTimeout(() => {
        updateTask({
          taskId: selectedTask.id,
          taskData: { description },
        });
      }, 1000); // 1 second debounce
    }

    // Cleanup timeout on unmount or when description changes
    return () => {
      if (descriptionTimeoutRef.current) {
        clearTimeout(descriptionTimeoutRef.current);
      }
    };
  }, [description, selectedTask.id, selectedTask.description, updateTask]);

  // Debounced update for status
  useEffect(() => {
    // Clear existing timeout
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }

    // Only update if status has actually changed from original
    if (status !== selectedTask.status) {
      statusTimeoutRef.current = setTimeout(() => {
        updateTask({
          taskId: selectedTask.id,
          taskData: { status },
        });
      }, 500); // 500ms debounce for status (shorter since it's a dropdown)
    }

    // Cleanup timeout on unmount or when status changes
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, [status, selectedTask.id, selectedTask.status, updateTask]);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

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
      <SheetContent className="grid grid-rows-[auto_1fr_1fr_auto] !w-[30vw] !max-w-[30vw] gap-2 p-2">
        <SheetHeader className="flex flex-col gap-2 p-0">
          <SheetTitle className="">
            <Input
              value={title}
              onChange={handleTitleChange}
              placeholder="Task Title"
              className="border-none"
            />
          </SheetTitle>
          <SheetDescription>
            <Textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Task Description"
              className="min-h-[60px] resize-none border-none"
            />
          </SheetDescription>
          <Separator />
        </SheetHeader>
        <div className="grid grid-rows-[auto_auto_auto_1fr] gap-3">
          <div className="flex flex-row items-center gap-2">
            <h3 className="text-sm font-medium"> Status:</h3>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px] rounded-none">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notStarted">Not Started</SelectItem>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="inProgress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
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
                className="h-full rounded-none"
                placeholder="Add notes to this task..."
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
