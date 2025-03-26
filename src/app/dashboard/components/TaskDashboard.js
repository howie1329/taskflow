"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Loading from "@/app/components/loading";
import useGetTasks from "@/hooks/useGetTasks";
import datas from "@/app/taskData.json";
import useUpload from "@/hooks/useUpload";
import { EditTaskForm } from "@/app/features/tasks/components/EditTaskForm";
import { TaskModal } from "@/app/features/tasks/components/TaskModal";

const filterTaskPriority = (data, priority) => {
  return data
    .filter((task) => task.priority === priority)
    .sort((task1, task2) => task1.position - task2.position)
    .map((task, key) => <TaskModal key={key} task={task} />);
};

const TaskPrioritySection = ({ title, tasks }) => {
  return (
    <div className="flex flex-col gap-2 items-center">
      <h2 className="font-bold">{title}</h2>
      {tasks}
      <EditTaskForm />
    </div>
  );
};

const TaskDashboard = () => {
  const { data, isLoading, error, isError } = useGetTasks();
  const [dateGrouped, setDateGrouped] = useState({});
  const mutation = useUpload();

  const onClick = () => {
    datas.map((data) => {
      mutation.mutate(data);
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <p>{error.message}</p>;
  }

  const grouped = (tasks) => {
    const today = new Date();
    const groupings = {
      Today: { High: [], Medium: [], Low: [], None: [] },
      ThisWeek: { High: [], Medium: [], Low: [], None: [] },
      OverDue: { High: [], Medium: [], Low: [], None: [] },
      NoDeadLine: { High: [], Medium: [], Low: [], None: [] },
    };

    tasks.forEach((task) => {
      const { priority, date } = task;
      const taskDate = new Date(date);
      const isToday = taskDate.toDateString() === today.toDateString();
      const isThisWeek =
        taskDate >= today &&
        taskDate <= new Date(today.setDate(today.getDate() + 7));
      const isOverDue = taskDate < today;
      const isNoDeadLine = !date;

      if (isToday) {
        groupings.Today[priority].push(task);
      } else if (isThisWeek) {
        groupings.ThisWeek[priority].push(task);
      } else if (isNoDeadLine) {
        groupings.NoDeadLine[priority].push(task);
      } else if (isOverDue) {
        groupings.OverDue[priority].push(task);
      }
    });
    return groupings;
  };

  const newTaskGroups = grouped(data);

  const nonePriorityTasks = filterTaskPriority(data, "None");
  const lowPriorityTasks = filterTaskPriority(data, "Low");
  const mediumPriorityTasks = filterTaskPriority(data, "Medium");
  const highPriorityTasks = filterTaskPriority(data, "High");

  return (
    <div className="flex flex-col w-full h-screen gap-2">
      <h2 className="font-semibold text-xl text-center">Task Cards</h2>
      <Button onClick={onClick}>Upload JSON</Button>
      <div className="flex justify-evenly ">
        {Object.keys(newTaskGroups).map((section) => (
          <div
            className="w-full h-screen overflow-scroll border-red-500 border-2"
            key={section}
          >
            <p>{section}</p>
            {Object.entries(newTaskGroups[section]).map(([priority, tasks]) => (
              <div className="" key={priority}>
                <h3>{priority}</h3>
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <TaskModal key={index} task={task} />
                  ))
                ) : (
                  <p>No Task Here.</p>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* <TaskPrioritySection title="None" tasks={nonePriorityTasks} />
        <TaskPrioritySection title="Low Priority" tasks={lowPriorityTasks} />
        <TaskPrioritySection
          title="Medium Priority"
          tasks={mediumPriorityTasks}
        />
        <TaskPrioritySection title="High Priority" tasks={highPriorityTasks} /> */}
      </div>
    </div>
  );
};

export default TaskDashboard;
