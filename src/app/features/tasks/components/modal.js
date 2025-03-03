"use client";
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
  FormLabel,
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
import SubTaskView from "./subTaskView";

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.date(),
});

export const CreateTaskModal = ({ handleModalToggle }) => {
  const [subTaskSwitch, setSubTaskSwitch] = useState(false);
  const [subTask, setSubTask] = useState([{}]);
  const mutation = useUpload();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
    },
  });

  const onSubmit = (data) => {
    data["date"] = format(data.date, "P");
    data["subTasks"] = subTask;
    mutation.mutate(data);
    handleModalToggle();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white p-4 rounded w-1/2 h-fit space-y-4">
        <h2 className="text-xl font-semibold">New Task</h2>
        <div>
          <Switch
            id="subTask"
            checked={subTaskSwitch}
            onCheckedChange={() => setSubTaskSwitch(!subTaskSwitch)}
          >
            Sub Task
          </Switch>
          <Label>Need SubTasks?</Label>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              label="Title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Your Task" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the title of your task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              label="Description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
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
                  <FormLabel>Date</FormLabel>
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

            <div className="flex justify-between">
              <Button onClick={handleModalToggle}>Close</Button>
              <Button type="submit">Add Task</Button>
            </div>
          </form>
        </Form>

        {subTaskSwitch &&
          subTask.map((task, i) => (
            <SubTaskView
              key={i}
              task={task}
              subTask={subTask}
              setSubTask={setSubTask}
              index={i}
            />
          ))}

        {subTaskSwitch && (
          <Button onClick={() => setSubTask([...subTask, {}])}>
            Add Sub Task
          </Button>
        )}
      </div>
    </div>
  );
};
