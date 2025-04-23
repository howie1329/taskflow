"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, SeparatorHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import useTaskCreate from "@/features/tasks/hooks/useTaskCreate";

// UI Components
import { Card, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  date: z.date(),
  priority: z.string(),
});

const PrioritySelect = ({ field }) => (
  <FormItem className="flex flex-col space-y-2">
    <Label className="text-sm font-medium">Priority</Label>
    <Select onValueChange={field.onChange} defaultValue={field.value}>
      <FormControl>
        <SelectTrigger className="w-full h-10 bg-background">
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {["None", "Low", "Medium", "High"].map((priority) => (
          <SelectItem
            key={priority}
            value={priority}
            className="flex items-center gap-2"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                priority === "High"
                  ? "bg-red-500"
                  : priority === "Medium"
                  ? "bg-yellow-500"
                  : priority === "Low"
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />
            {priority}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FormItem>
);

const DatePicker = ({ field }) => (
  <FormItem className="flex flex-col space-y-2">
    <Label className="text-sm font-medium">Due Date</Label>
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={cn(
              "w-full h-10 pl-3 text-left font-normal",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value ? (
              format(field.value, "PPP")
            ) : (
              <span>Select a date</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={field.value}
          onSelect={field.onChange}
          disabled={(date) => date < new Date()}
          initialFocus
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  </FormItem>
);

const TaskFormFields = ({ form }) => (
  <div className="space-y-4 p-4">
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <Label className="text-sm font-medium">Task Title</Label>
          <FormControl>
            <Input
              className="h-10"
              placeholder="What needs to be done?"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <Label className="text-sm font-medium">Description</Label>
          <FormControl>
            <Textarea
              className="min-h-[100px] resize-none"
              placeholder="Add details about your task..."
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => <PrioritySelect field={field} />}
      />
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => <DatePicker field={field} />}
      />
    </div>
  </div>
);

export const TaskCreateModal = () => {
  const mutation = useTaskCreate();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      priority: "None",
    },
  });

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      date: format(data.date, "P"),
    };
    mutation.mutate(formattedData);
    form.reset();
  };

  return (
    <Collapsible className="w-full">
      <Card className="w-full border-none shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="text-lg font-semibold">Create New Task</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <SeparatorHorizontal className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TaskFormFields form={form} />
              <div className="flex justify-end p-4 border-t">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </Form>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
