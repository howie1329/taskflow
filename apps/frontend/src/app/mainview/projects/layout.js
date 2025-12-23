import ProjectSidebar from "@/presentation/components/projects/layout/ProjectSidebar";
import React from "react";

export default function Layout({ children }) {
  return (
    <div className="grid grid-cols-[200px_1fr] h-full">
      <ProjectSidebar />
      <main className="flex items-center justify-center  ">{children}</main>
    </div>
  );
}
