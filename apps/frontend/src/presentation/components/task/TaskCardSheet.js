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
import useCreateSubtask from "@/hooks/tasks/subtasks/useCreateSubtask";
import useUpdateSubtask from "@/hooks/tasks/subtasks/useUpdateSubtask";
import useDeleteSubtask from "@/hooks/tasks/subtasks/useDeleteSubtask";
import useDeleteTask from "@/hooks/tasks/useDeleteTask";
import useUpdateTask from "@/hooks/tasks/useUpdateTask";
import {
  Trash2Icon,
  PlusIcon,
  XIcon,
  PencilIcon,
  CheckIcon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertCircleIcon,
  HugeiconsFreeIcons,
} from "@hugeicons/core-free-icons/index";

export const TaskCardSheet = ({ selectedTask, isOpen, onOpenChange }) => {
  const {
    data: subtasks,
    isLoading,
    error,
  } = useFetchTaskSubtask(selectedTask.id, isOpen);
  const [title, setTitle] = useState(selectedTask.title);
  const [description, setDescription] = useState(selectedTask.description);
  const [status, setStatus] = useState(selectedTask.status);
  const [notes, setNotes] = useState(selectedTask.notes);
  const [dueDate, setDueDate] = useState(
    selectedTask.date
      ? new Date(selectedTask.date).toISOString().split("T")[0]
      : ""
  );
  const [labels, setLabels] = useState(selectedTask.labels || []);
  const [newLabel, setNewLabel] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskName, setEditingSubtaskName] = useState("");
  const [newSubtaskName, setNewSubtaskName] = useState("");

  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: completeSubtask } = useCompleteSubtask();
  const { mutate: incompleteSubtask } = useIncompleteSubtask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: createSubtask } = useCreateSubtask();
  const { mutate: updateSubtask } = useUpdateSubtask();
  const { mutate: deleteSubtask } = useDeleteSubtask();

  // Refs to store timeout IDs for debouncing
  const titleTimeoutRef = useRef(null);
  const descriptionTimeoutRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const dueDateTimeoutRef = useRef(null);

  // Update local state when selectedTask changes
  useEffect(() => {
    setTitle(selectedTask.title);
    setDescription(selectedTask.description);
    setStatus(selectedTask.status);
    setNotes(selectedTask.notes);
    setDueDate(
      selectedTask.date
        ? new Date(selectedTask.date).toISOString().split("T")[0]
        : ""
    );
    setLabels(selectedTask.labels || []);
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

  // Debounced update for due date
  useEffect(() => {
    if (dueDateTimeoutRef.current) {
      clearTimeout(dueDateTimeoutRef.current);
    }

    const originalDate = selectedTask.date
      ? new Date(selectedTask.date).toISOString().split("T")[0]
      : "";
    if (dueDate !== originalDate) {
      dueDateTimeoutRef.current = setTimeout(() => {
        updateTask({
          taskId: selectedTask.id,
          taskData: { date: dueDate || null },
        });
      }, 1000);
    }

    return () => {
      if (dueDateTimeoutRef.current) {
        clearTimeout(dueDateTimeoutRef.current);
      }
    };
  }, [dueDate, selectedTask.id, selectedTask.date, updateTask]);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value);
  };

  const handleCheckedChange = (subtaskId, isComplete) => {
    if (isComplete) {
      incompleteSubtask({ id: subtaskId, taskId: selectedTask.id });
    } else {
      completeSubtask({ id: subtaskId, taskId: selectedTask.id });
    }
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      const updatedLabels = [...labels, newLabel.trim()];
      setLabels(updatedLabels);
      setNewLabel("");
      updateTask({
        taskId: selectedTask.id,
        taskData: { labels: updatedLabels },
      });
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    const updatedLabels = labels.filter((label) => label !== labelToRemove);
    setLabels(updatedLabels);
    updateTask({
      taskId: selectedTask.id,
      taskData: { labels: updatedLabels },
    });
  };

  const handleLabelKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLabel();
    }
  };

  const handleStartEditSubtask = (subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskName(subtask.subtaskName);
  };

  const handleSaveSubtask = (subtaskId) => {
    if (editingSubtaskName.trim()) {
      updateSubtask({
        subtaskId,
        subtaskData: { subtaskName: editingSubtaskName.trim() },
        taskId: selectedTask.id,
      });
      setEditingSubtaskId(null);
      setEditingSubtaskName("");
    }
  };

  const handleCancelEditSubtask = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskName("");
  };

  const handleDeleteSubtask = (subtaskId) => {
    deleteSubtask({ subtaskId, taskId: selectedTask.id });
  };

  const handleCreateSubtask = () => {
    if (newSubtaskName.trim() && selectedTask?.id) {
      const subtaskData = {
        taskId: selectedTask.id,
        subtaskName: newSubtaskName.trim(),
        isComplete: false,
      };
      console.log("Creating subtask with data:", subtaskData);
      createSubtask(subtaskData);
      setNewSubtaskName("");
    }
  };

  const handleSubtaskKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateSubtask();
    }
  };

  const deleteButtonClick = () => {
    deleteTask(selectedTask.id);
  };

  const LoadingSubtasks = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Badge variant="outline">
          <Spinner />
          Loading Subtasks...
        </Badge>
      </div>
    );
  };
  const ErrorSubtasks = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Badge variant="outline">
          <HugeiconsFreeIcons icon={<AlertCircleIcon />} />
          Error Loading Subtasks...
        </Badge>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="grid grid-rows-[auto_1fr_auto] gap-1 p-2 h-full overflow-hidden">
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
        <div className="grid grid-rows-[auto_auto_auto_auto_1fr] gap-3 overflow-y-auto h-full">
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

          <div className="flex flex-row items-center gap-2">
            <h3 className="text-sm font-medium">Due Date: </h3>
            <Input
              type="date"
              value={dueDate}
              onChange={handleDueDateChange}
              className="w-[180px] rounded-none"
            />
          </div>

          <div className="flex flex-col gap-2 overflow-x-auto ">
            <div className="flex flex-row items-center gap-2">
              <h3 className="text-sm font-medium">Labels:</h3>
              <div className="flex flex-row w-full gap-1 flex-wrap overflow-x-auto ">
                {labels.map((label) => (
                  <Badge
                    key={label}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {label.charAt(0).toUpperCase() + label.slice(1)}
                    <button
                      onClick={() => handleRemoveLabel(label)}
                      className="ml-1 hover:text-destructive"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={handleLabelKeyPress}
                placeholder="Add label..."
                className="flex-1 rounded-none"
              />
              <Button
                onClick={handleAddLabel}
                size="sm"
                variant="outline"
                className="rounded-none"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Subtasks:</h3>
            {isLoading && <LoadingSubtasks />}
            {error && <ErrorSubtasks />}
            {subtasks && (
              <div className="flex flex-col gap-2">
                {subtasks &&
                  subtasks.map((subTask) => (
                    <div
                      className="flex flex-row items-center gap-2"
                      key={subTask.id}
                    >
                      <Checkbox
                        checked={subTask.isComplete}
                        onCheckedChange={() => {
                          handleCheckedChange(subTask.id, subTask.isComplete);
                        }}
                      />
                      {editingSubtaskId === subTask.id ? (
                        <div className="flex flex-row items-center gap-1 flex-1">
                          <Input
                            value={editingSubtaskName}
                            onChange={(e) =>
                              setEditingSubtaskName(e.target.value)
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleSaveSubtask(subTask.id);
                              } else if (e.key === "Escape") {
                                handleCancelEditSubtask();
                              }
                            }}
                            className="flex-1 rounded-none text-sm"
                            autoFocus
                          />
                          <Button
                            onClick={() => handleSaveSubtask(subTask.id)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <CheckIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={handleCancelEditSubtask}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <XIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-row items-center gap-2 flex-1">
                          <p
                            className="text-sm text-gray-500 flex-1 cursor-pointer"
                            onDoubleClick={() =>
                              handleStartEditSubtask(subTask)
                            }
                          >
                            {subTask.subtaskName}
                          </p>
                          <Button
                            onClick={() => handleStartEditSubtask(subTask)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteSubtask(subTask.id)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive"
                          >
                            <Trash2Icon className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                <div className="flex flex-row items-center gap-2">
                  <Input
                    value={newSubtaskName}
                    onChange={(e) => setNewSubtaskName(e.target.value)}
                    onKeyPress={handleSubtaskKeyPress}
                    placeholder="Add subtask..."
                    className="flex-1 rounded-none"
                  />
                  <Button
                    onClick={handleCreateSubtask}
                    size="sm"
                    variant="outline"
                    className="rounded-none"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <h3 className="text-sm font-medium mt-4">Notes:</h3>
            <Textarea
              className="h-full rounded-none"
              placeholder="Add notes to this task..."
            />
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
