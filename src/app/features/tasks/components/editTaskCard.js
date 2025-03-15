import { Card, CardHeader } from "@/components/ui/card";
import { CalendarIcon, SeparatorHorizontal } from "lucide-react";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useUpload from "@/hooks/useUpload";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  date: z.date(),
  priority: z.string(),
});

export const EditTaskCard = () => {
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
    data["date"] = format(data.date, "P");
    console.log(data);
    mutation.mutate(data);
    form.reset();
  };

  return (
    <Collapsible>
      <Card className=" flex flex-col h-fit w-[23rem] mb-2 p-1">
        <div className="flex flex-row justify-between items-center">
          <h4 className="font-semibold">Create New Task</h4>
          <CollapsibleTrigger>
            <Button variant="ghost" size="sm">
              <SeparatorHorizontal className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-2 items-center">
                  <Label>Priority</Label>
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
                            <SelectTrigger className="w-32 h-8">
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
                </div>
              </CardHeader>
              <FormField
                control={form.control}
                name="title"
                label="Title"
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
                label="Description"
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
                label="Date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal h-fit",
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
              <Button type="submit">Submit</Button>{" "}
            </form>
          </Form>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
