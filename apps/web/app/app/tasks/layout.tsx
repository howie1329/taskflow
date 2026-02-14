export const metadata = {
  title: "Tasks | Taskflow",
  description: "Manage your tasks and to-dos",
};

import { TasksLayoutShell } from "./tasks-layout-shell";

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TasksLayoutShell>{children}</TasksLayoutShell>;
}
