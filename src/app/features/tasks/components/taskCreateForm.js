import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import useUpload from "@/hooks/useUpload";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SubTaskInput from "@/app/dashboard/components/SubTaskInput";
import { useAuth } from "@clerk/nextjs";

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  labels: z.string(),
  date: z.date(),
  priority: z.string(),
});

export const TaskCreateForm = () => {
  const { getToken, userId } = useAuth();
  const [subTaskSwitch, setSubTaskSwitch] = useState(false);
  const [subTask, setSubTask] = useState([]);
  const mutation = useUpload();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      labels: "",
      date: new Date(),
      priority: "None",
    },
  });

  const onSubmit = (data) => {
    const token = getToken();
    data["date"] = format(data.date, "P");
    data["subTasks"] = subTask;
    data["token"] = token;
    data["userId"] = userId;
    mutation.mutate(data);
    //handleModalToggle();
  };

  return (
    <Form {...form}>
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="priority"
            label="Priority"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-32">
                      <SelectValue value="Priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Label>Priority</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="subTask"
            checked={subTaskSwitch}
            onCheckedChange={() => setSubTaskSwitch(!subTaskSwitch)}
          >
            Sub Task
          </Switch>
          <Label>Need SubTasks?</Label>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          label="Title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Enter Your Task" {...field} />
              </FormControl>
              <FormDescription>This is the title of your task.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="labels"
          label="Labels"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Enter Labels" {...field} />
              </FormControl>
              <FormDescription>Seperate Labels with a comma</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          label="Description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  className="resize-none"
                  placeholder="Enter Description"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is the description of your task.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          label="Date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "P")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Due Date Of Task</FormDescription>
            </FormItem>
          )}
        />
        <div className="flex flex-col flex-1 space-y-2 overflow-auto max-h-[80px]">
          {subTaskSwitch &&
            subTask.map((task, i) => (
              <SubTaskInput
                key={i}
                task={task}
                subTask={subTask}
                setSubTask={setSubTask}
                index={i}
              />
            ))}
        </div>
        <div className="flex justify-between">
          <Button type="submit">Add Task</Button>
        </div>
      </form>
    </Form>
  );
};
