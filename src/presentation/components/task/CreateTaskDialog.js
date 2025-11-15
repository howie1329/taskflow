"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useCreateTask from "@/hooks/tasks/useCreateTask";
import { useAuth } from "@clerk/nextjs";
import { format } from "date-fns";

export const CreateTaskDialog = ({ isOpen, onOpenChange }) => {
  const mutation = useCreateTask();
  const { userId } = useAuth();
  const [status, setStatus] = useState("notStarted");
  const [priority, setPriority] = useState("Low");
  const [date, setDate] = useState(new Date());
  const [subtasks, setSubtasks] = useState([""]); // Start with one empty subtask
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [labels, setLabels] = useState("");
  const [testLabel, setTestLabel] = useState([]);
  // Add new subtask input when user types in the last one
  const handleSubtaskChange = (index, value) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;

    // If user types in the last subtask, add a new empty one
    if (index === subtasks.length - 1 && value.trim() !== "") {
      newSubtasks.push("");
    }

    // Remove empty subtasks (except the last one)
    const filteredSubtasks = newSubtasks.filter(
      (subtask, i) => subtask.trim() !== "" || i === newSubtasks.length - 1
    );

    setSubtasks(filteredSubtasks);
  };

  const handleCreateTask = () => {
    const formattedTask = {
      title,
      description,
      labels: testLabel,
      status,
      priority,
      date: format(date, "P"),
      user_id: userId,
      subtasks: subtasks,
    };
    mutation.mutate(formattedTask);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[50vw] !max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="grid grid-cols-3 gap-2 ">
          <div className="col-span-2 gap-2 flex flex-col">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task Description"
            />

            <div className="grid grid-cols-3 gap-2">
              <TaskFormStatusDropdown status={status} setStatus={setStatus} />
              <TaskFormPriorityDropdown
                priority={priority}
                setPriority={setPriority}
              />
              <TaskFormDateInput date={date} setDate={setDate} />
            </div>

            <Input
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="Task Labels"
            />

            <p>Project Placeholder</p>
            <p>Phases Placeholder</p>

            {/* Subtask Area */}
          </div>

          <div className="col-span-1 gap-2 flex flex-col">
            <TaskFormSubTaskArea
              subtasks={subtasks}
              onSubtaskChange={handleSubtaskChange}
            />
          </div>
          <div className="col-span-3 ">
            <Button className="w-full" onClick={handleCreateTask}>
              Create Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TaskFormSubTaskArea = ({ subtasks, onSubtaskChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-2">
        {subtasks.map((subtask, index) => (
          <Input
            key={index}
            placeholder={`Subtask ${index + 1}`}
            value={subtask}
            onChange={(e) => onSubtaskChange(index, e.target.value)}
            className="text-sm"
          />
        ))}
      </div>
    </div>
  );
};

const TaskFormDateInput = ({ date, setDate }) => {
  // Need to look into shadcn/ui input component to make it work with the date picker
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium">Due Date</p>
      <Input
        className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-6 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        type="date"
        placeholder="MM/DD/YYYY"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
        }}
      />
    </div>
  );
};

const TaskFormPriorityDropdown = ({ priority, setPriority }) => {
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "Low":
        return "Low";
      case "Medium":
        return "Medium";
      case "High":
        return "High";
    }
  };
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium">Priority</p>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <p className="border border-input bg-background hover:bg-accent hover:text-accent-foreground py-1 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
            {getPriorityLabel(priority)}
          </p>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setPriority("Low")}>
            Low
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPriority("Medium")}>
            Medium
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPriority("High")}>
            High
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const TaskFormStatusDropdown = ({ status, setStatus }) => {
  const getStatusLabel = (status) => {
    switch (status) {
      case "notStarted":
        return "Not Started";
      case "todo":
        return "Todo";
      case "inProgress":
        return "In Progress";
      case "overdue":
        return "Overdue";
      case "done":
        return "Done";
      default:
        return "Not Started";
    }
  };
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium">Status</p>
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full">
          <p className="border border-input bg-background hover:bg-accent hover:text-accent-foreground py-1 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
            {getStatusLabel(status)}
          </p>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setStatus("notStarted")}>
            Not Started
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatus("todo")}>
            Todo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatus("inProgress")}>
            In Progress
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatus("overdue")}>
            OverDue
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatus("done")}>
            Done
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
