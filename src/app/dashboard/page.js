"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useState } from "react";
import { QuickNotes } from "./components/QuickNotes";
import { Timer } from "./components/Timer";
import { TaskCreateDialog } from "@/features/tasks/TaskCreateDialog";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@clerk/nextjs";
import useGetTasks from "@/features/tasks/hooks/useGetTasks";
import { TaskModal } from "@/features/tasks/TaskModal";

const Page = () => {
  const { userId } = useAuth();
  const [date, setDate] = useState(new Date());
  const { data: tasks, isLoading: isTaskLoading } = useGetTasks(userId);
  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks?.filter((task) => task.date === today) || [];

  return (
    <div className="h-screen w-screen p-4">
      <Card className="h-[98%] w-[94%]">
        <CardContent className="h-full p-6 space-y-6 overflow-hidden">
          <div className="flex justify-between items-center min-h-[60px]">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back to your workspace
              </p>
            </div>
            <div className="flex-shrink-0">
              <TaskCreateDialog />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-100px)] overflow-hidden">
            {/* Today's Tasks Section */}
            <Card className="col-span-1 h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">
                  Today&apos;s Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-60px)] max-h-[500px] overflow-y-auto">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground ">
                    {todayTasks.length === 0
                      ? "No tasks for today"
                      : todayTasks.map((task) => (
                          <TaskModal key={task.id} task={task} />
                        ))}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Section */}
            <Card className="col-span-1 h-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-60px)]">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Timer Section */}
            <Timer className="col-span-1 h-full" />

            {/* Quick Notes Section */}
            <Card className="col-span-1 lg:col-span-3 h-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Quick Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-60px)]">
                <QuickNotes />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
