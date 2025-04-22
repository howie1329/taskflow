"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, SeparatorHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import useUpload from "@/hooks/useUpload";

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
  <div className="flex flex-row gap-2 items-center">
    <Label>Priority</Label>
    <FormItem>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger className="w-32 h-8">
            <SelectValue value="Priority" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {["None", "Low", "Medium", "High"].map((priority) => (
            <SelectItem key={priority} value={priority}>
              {priority}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>
  </div>
);

const DatePicker = ({ field }) => (
  <FormItem className="flex flex-col">
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] pl-3 text-left font-normal h-fit",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value ? format(field.value, "P") : <span>Pick a date</span>}
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
);

const TaskFormFields = ({ form }) => (
  <>
    <CardHeader className="flex flex-row justify-between items-center">
      <FormField
        control={form.control}
        name="priority"
        label="Priority"
        render={({ field }) => <PrioritySelect field={field} />}
      />
    </CardHeader>

    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              className="h-fit my-1"
              placeholder="Enter Your Task"
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
          <FormControl>
            <Textarea
              className="resize-none my-1"
              placeholder="Enter Description"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="date"
      render={({ field }) => <DatePicker field={field} />}
    />
  </>
);

export const TaskCreateModal = () => {
  const mutation = useUpload();
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
    <Collapsible>
      <Card className="flex flex-col h-fit w-full p-1">
        <div className="flex flex-row justify-between items-center">
          <h4 className="font-semibold text-sm">Create New Task</h4>
          <CollapsibleTrigger>
            <Button variant="ghost" size="sm">
              <SeparatorHorizontal className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TaskFormFields form={form} />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
