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
import useTaskCreate from "@/features/tasks/hooks/useTaskCreate";
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
import { Card, CardContent } from "@/components/ui/card";

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
  const [subTask, setSubTask] = useState([{}]);
  const mutation = useTaskCreate();

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
    if (subTaskSwitch) {
      data["subTasks"] = subTask;
    }
    data["token"] = token;
    data["userId"] = userId;
    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg">
      <CardContent className="p-6">
        <Form {...form}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-3">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Priority:</Label>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-fit">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="subTask"
                checked={subTaskSwitch}
                onCheckedChange={() => setSubTaskSwitch(!subTaskSwitch)}
              />
              <Label htmlFor="subTask" className="text-sm font-medium">
                Enable Subtasks
              </Label>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter Your Task"
                      className="h-11 text-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the title of your task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="labels"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter Labels" {...field} />
                    </FormControl>
                    <FormDescription>
                      Separate Labels with a comma
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full h-11 justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
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
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      className="min-h-[120px] resize-none"
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

            {subTaskSwitch && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Subtasks</Label>
                <div className="flex flex-col space-y-2 overflow-auto max-h-[200px] p-3 bg-muted/10 rounded-lg">
                  {subTask.map((task, i) => (
                    <SubTaskInput
                      key={i}
                      task={task}
                      subTask={subTask}
                      setSubTask={setSubTask}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" className="w-full md:w-auto">
                Create Task
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
